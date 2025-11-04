import { json, type RequestHandler } from '@sveltejs/kit'
import SupabaseAdapter from '$lib/adapters/supabase/index'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { ClientNoId, Investment, Portfolio, Transaction } from '$lib/types'
import {
	calculatePortfolioProjection,
	calculateInvestmentProjection,
	getCurrentPortfolioValueService,
	compareScenarios,
	type PortfolioScenario,
	type InvestmentScenario,
} from './calculation-service'
import { z } from 'zod'
import type { Adapter } from '$lib/adapters/index'
import { serviceAdapter } from '$lib/adapters/service' // New import
import { createClient } from '@supabase/supabase-js' // Re-added

// MCP-compatible API for Kalkul Financial Planning Database Operations
// This implements the full Model Context Protocol (MCP) JSON-RPC 2.0 interface

interface MCPTool {
	name: string
	description: string
	inputSchema: {
		type: string
		properties: Record<string, unknown>
		required?: string[]
	}
}

// JSON-RPC 2.0 request format
interface JsonRpcRequest {
	jsonrpc: '2.0'
	id?: number | string
	method: string
	params?: Record<string, unknown>
}

// JSON-RPC 2.0 response format
interface JsonRpcResponse {
	jsonrpc: '2.0'
	id: number | string | undefined
	result?: unknown
	error?: {
		code: number
		message: string
		data?: unknown
	}
}

interface MCPResponse {
	content?: Array<{
		type: string
		text: string
	}>
	isError?: boolean
	error?: {
		code: string
		message: string
	}
}

// Zod schemas for type-safe argument parsing
const idSchema = z.object({
	id: z.number(),
})

const clientIdSchema = z.object({
	client_id: z.number(),
})

const portfolioIdSchema = z.object({
	portfolio_id: z.number(),
})

const investmentIdSchema = z.object({
	investment_id: z.number(),
})

const identifierSchema = z.object({
	identifier: z.string(),
	id_type: z.string().optional(),
	updated_after: z.string().optional(),
})

const addClientArgsSchema = z.object({
	name: z.string(),
	birth_date: z.string(),
	email: z.string().email().optional(),
})

const updateClientArgsSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		birth_date: z.string(),
		email: z.string().email().optional(),
	})
	.passthrough()

const addPortfolioArgsSchema = z.object({
	client_id: z.number(),
	name: z.string(),
	start_date: z.string(),
	end_date: z.string(),
	currency: z.string().optional(),
	inflation_rate: z.number().optional(),
})

const updatePortfolioArgsSchema = z.object({
	id: z.number(),
	client_id: z.number().optional(),
	name: z.string().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	currency: z.string().optional(),
	inflation_rate: z.number().optional(),
})

const addInvestmentArgsSchema = z.object({
	portfolio_id: z.number(),
	name: z.string(),
	apy: z.number().optional(),
	entry_fee: z.number().optional(),
	exit_fee: z.number().optional(),
	management_fee: z.number().optional(),
	success_fee: z.number().optional(),
	ter: z.number().optional(),
	advanced_fees: z.boolean().optional(),
	type: z.string().optional(),
})

const updateInvestmentArgsSchema = z
	.object({
		id: z.number(),
	})
	.passthrough()

const addTransactionArgsSchema = z.object({
	investment_id: z.number(),
	type: z.enum(['deposit', 'withdrawal']),
	amount: z.number(),
	date: z.string(),
	end_date: z.string().optional(),
	repeat_unit: z.enum(['day', 'week', 'month', 'year']).optional(),
	repeat: z.number().optional(),
	label: z.string().optional(),
	inflation_adjusted: z.boolean().optional(),
})

const updateTransactionArgsSchema = z
	.object({
		id: z.number(),
		investment_id: z.number().optional(),
		type: z.enum(['deposit', 'withdrawal']).optional(),
		amount: z.number().optional(),
		date: z.string(),
		end_date: z.string().optional(),
		repeat_unit: z.enum(['day', 'week', 'month', 'year']).optional(),
		repeat: z.number().optional(),
		label: z.string().optional(),
		inflation_adjusted: z.boolean().optional(),
	})
	.passthrough()

const addMarketDataArgsSchema = z.object({
	identifier: z.string(),
	id_type: z.string(),
	data: z.unknown(),
})

const reportErrorArgsSchema = z.object({
	identifier: z.string(),
	error: z.unknown(),
})

const duplicatePortfolioArgsSchema = z.object({
	portfolio_id: z.number(),
	new_name: z.string(),
})

const TOOLS: MCPTool[] = [
	// ChatGPT required tools
	{
		name: 'search',
		description:
			'Search for entities by text matching OR list all entities of a type. Searches names, emails, and labels for the query string. Use list_all=true to get all entities without text filtering.',
		inputSchema: {
			type: 'object',
			properties: {
				query: {
					type: 'string',
					description:
						'Text to search for in names, emails, and labels (case-insensitive substring match). Example: "retirement" will find clients/portfolios/investments with "retirement" in their name. Not required if list_all is true.',
				},
				entity_type: {
					type: 'string',
					enum: ['client', 'portfolio', 'investment', 'all'],
					description:
						'Type of entity to search within. Use "all" to search across all entity types. Required when list_all is true to specify which entities to list.',
				},
				list_all: {
					type: 'boolean',
					description:
						'Set to true to list all entities of the specified entity_type without text filtering. When true, query is ignored. Use this to get all clients, all portfolios, or all investments.',
					default: false,
				},
				limit: {
					type: 'number',
					description: 'Maximum number of results to return',
					default: 10,
				},
			},
			required: [],
		},
	},
	{
		name: 'fetch',
		description: 'Fetch complete details for a specific entity by ID',
		inputSchema: {
			type: 'object',
			properties: {
				entity_type: {
					type: 'string',
					enum: ['client', 'portfolio', 'investment', 'transaction'],
					description: 'Type of entity to fetch',
				},
				id: {
					type: 'number',
					description: 'Entity ID',
				},
			},
			required: ['entity_type', 'id'],
		},
	},

	// Client management tools
	{
		name: 'get_clients',
		description: 'Get all clients for the current user',
		inputSchema: {
			type: 'object',
			properties: {},
		},
	},
	{
		name: 'add_client',
		description: 'Create a new client profile',
		inputSchema: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'Client full name' },
				birth_date: {
					type: 'string',
					description: 'Client birth date (YYYY-MM-DD, required)',
				},
				email: { type: 'string', description: 'Client email address (optional)' },
			},
			required: ['name', 'birth_date'],
		},
	},
	{
		name: 'update_client',
		description: 'Update client information',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'number', description: 'Client ID' },
				name: { type: 'string', description: 'Client full name' },
				birth_date: { type: 'string', description: 'Client birth date (YYYY-MM-DD)' },
				email: { type: 'string', description: 'Client email address (optional)' },
			},
			required: ['id', 'name', 'birth_date'],
		},
	},
	{
		name: 'delete_client',
		description: 'Delete a client and all associated data',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'number', description: 'Client ID to delete' },
			},
			required: ['id'],
		},
	},

	// Portfolio management tools
	{
		name: 'get_portfolios',
		description: 'Get all portfolios for a specific client',
		inputSchema: {
			type: 'object',
			properties: {
				client_id: { type: 'number', description: 'Client ID to get portfolios for' },
			},
			required: ['client_id'],
		},
	},
	{
		name: 'add_portfolio',
		description: 'Create a new portfolio for a client',
		inputSchema: {
			type: 'object',
			properties: {
				client_id: { type: 'number', description: 'Client ID' },
				name: { type: 'string', description: 'Portfolio name' },
				start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
				end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
				currency: {
					type: 'string',
					description: 'Portfolio currency (CZK, EUR, USD)',
					default: 'CZK',
				},
				inflation_rate: {
					type: 'number',
					description: 'Annual inflation rate (as decimal)',
					default: 0.03,
				},
			},
			required: ['client_id', 'name', 'start_date', 'end_date'],
		},
	},
	{
		name: 'update_portfolio',
		description: 'Update portfolio information',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'number', description: 'Portfolio ID' },
				client_id: { type: 'number', description: 'Client ID' },
				name: { type: 'string', description: 'Portfolio name' },
				start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
				end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
				currency: { type: 'string', description: 'Portfolio currency' },
				inflation_rate: { type: 'number', description: 'Annual inflation rate' },
			},
			required: ['id'],
		},
	},
	{
		name: 'delete_portfolio',
		description: 'Delete a portfolio and all associated data',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'number', description: 'Portfolio ID to delete' },
			},
			required: ['id'],
		},
	},
	{
		name: 'duplicate_portfolio',
		description: 'Duplicate a portfolio with all its investments and transactions',
		inputSchema: {
			type: 'object',
			properties: {
				client_id: { type: 'number', description: 'Client ID who owns the portfolio' },
				portfolio_id: { type: 'number', description: 'Portfolio ID to duplicate' },
				new_name: { type: 'string', description: 'New name for the duplicated portfolio' },
			},
			required: ['client_id', 'portfolio_id', 'new_name'],
		},
	},
	{
		name: 'get_portfolio_view',
		description: 'Get complete portfolio data including client, investments, and transactions',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'Portfolio ID' },
			},
			required: ['id'],
		},
	},

	// Investment management tools
	{
		name: 'get_investments',
		description: 'Get all investments for a specific portfolio',
		inputSchema: {
			type: 'object',
			properties: {
				portfolio_id: { type: 'number', description: 'Portfolio ID to get investments for' },
			},
			required: ['portfolio_id'],
		},
	},
	{
		name: 'add_investment',
		description: 'Add an investment to a portfolio',
		inputSchema: {
			type: 'object',
			properties: {
				portfolio_id: { type: 'number', description: 'Portfolio ID' },
				name: { type: 'string', description: 'Investment name' },
				apy: { type: 'number', description: 'Annual percentage yield (as decimal)' },
				management_fee: { type: 'number', description: 'Management fee (as decimal)' },
				success_fee: { type: 'number', description: 'Success fee (as decimal)' },
				ter: { type: 'number', description: 'Total expense ratio (as decimal)' },
				entry_fee: { type: 'number', description: 'Entry fee (as decimal)' },
				exit_fee: { type: 'number', description: 'Exit fee (as decimal)' },
				advanced_fees: {
					type: 'boolean',
					description: 'Whether to use advanced fee structure',
					default: false,
				},
				type: { type: 'string', description: 'Investment type', default: 'investment' },
			},
			required: ['portfolio_id', 'name', 'apy'],
		},
	},
	{
		name: 'update_investment',
		description: 'Update investment information',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'number', description: 'Investment ID' },
				name: { type: 'string', description: 'Investment name' },
				apy: { type: 'number', description: 'Annual percentage yield' },
				management_fee: { type: 'number', description: 'Management fee' },
				success_fee: { type: 'number', description: 'Success fee' },
				ter: { type: 'number', description: 'Total expense ratio' },
				entry_fee: { type: 'number', description: 'Entry fee' },
				exit_fee: { type: 'number', description: 'Exit fee' },
				advanced_fees: { type: 'boolean', description: 'Advanced fee structure' },
				type: { type: 'string', description: 'Investment type' },
			},
			required: ['id'],
		},
	},
	{
		name: 'delete_investment',
		description: 'Delete an investment',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'number', description: 'Investment ID to delete' },
			},
			required: ['id'],
		},
	},

	// Transaction management tools
	{
		name: 'get_transactions',
		description: 'Get all transactions for a specific investment',
		inputSchema: {
			type: 'object',
			properties: {
				investment_id: { type: 'number', description: 'Investment ID to get transactions for' },
			},
			required: ['investment_id'],
		},
	},
	{
		name: 'add_transaction',
		description:
			'Add a transaction (deposit or withdrawal) to an investment. Transactions can be one-time or recurring.',
		inputSchema: {
			type: 'object',
			properties: {
				investment_id: { type: 'number', description: 'Investment ID (required)' },
				type: { type: 'string', description: 'Transaction type ("deposit" or "withdrawal")' },
				amount: { type: 'number', description: 'Transaction amount' },
				date: {
					type: 'string',
					description:
						'Transaction date (YYYY-MM-DD, required). For one-time transactions, this is the only date. For recurring transactions, this is when the recurring pattern starts.',
				},
				end_date: {
					type: 'string',
					description:
						'Transaction end date (YYYY-MM-DD, optional). Only required for recurring transactions to specify when they stop. Omit for one-time transactions.',
				},
				repeat_unit: {
					type: 'string',
					enum: ['day', 'week', 'month', 'year'],
					description:
						'Frequency unit for recurring transactions: must be exactly "day", "week", "month", or "year" (string). Omit for one-time transactions. Example: "month" means the transaction repeats monthly.',
				},
				repeat: {
					type: 'number',
					description:
						'How often the transaction repeats, combined with repeat_unit. MUST be a number (not a string). Default: 1. Examples: repeat=1 (number) with repeat_unit="month" means every month; repeat=3 (number) with repeat_unit="month" means every 3 months; repeat=1 (number) with repeat_unit="year" means annually. Omit for one-time transactions.',
					default: 1,
				},
				label: { type: 'string', description: 'Transaction label (optional)' },
				inflation_adjusted: {
					type: 'boolean',
					description:
						'Whether the transaction amount should be adjusted for inflation over time (optional)',
				},
			},
			required: ['investment_id', 'type', 'amount', 'date'],
		},
	},
	{
		name: 'update_transaction',
		description:
			'Update transaction information. Can change a one-time transaction to recurring or vice versa.',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'number', description: 'Transaction ID' },
				investment_id: { type: 'number', description: 'Investment ID' },
				type: { type: 'string', description: 'Transaction type ("deposit" or "withdrawal")' },
				amount: { type: 'number', description: 'Transaction amount' },
				date: {
					type: 'string',
					description: 'Transaction date (YYYY-MM-DD, required)',
				},
				end_date: {
					type: 'string',
					description:
						'Transaction end date (YYYY-MM-DD). Set for recurring transactions, omit or set to null for one-time transactions.',
				},
				repeat_unit: {
					type: 'string',
					enum: ['day', 'week', 'month', 'year'],
					description:
						'Frequency unit for recurring transactions: must be exactly "day", "week", "month", or "year" (string). Set to null to convert to one-time transaction.',
				},
				repeat: {
					type: 'number',
					description:
						'How often the transaction repeats, combined with repeat_unit. MUST be a number (not a string). Examples: repeat=1 (number) with repeat_unit="month" means every month; repeat=3 (number) with repeat_unit="month" means every 3 months.',
				},
				label: { type: 'string', description: 'Transaction label' },
				inflation_adjusted: {
					type: 'boolean',
					description: 'Whether the transaction amount should be adjusted for inflation over time',
				},
			},
			required: ['id'],
		},
	},
	{
		name: 'delete_transaction',
		description: 'Delete a transaction',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'number', description: 'Transaction ID to delete' },
			},
			required: ['id'],
		},
	},

	// Market data tools
	{
		name: 'get_market_data',
		description: 'Get market data for an investment by ISIN or ticker',
		inputSchema: {
			type: 'object',
			properties: {
				identifier: { type: 'string', description: 'ISIN or ticker symbol' },
				id_type: { type: 'string', description: 'Identifier type (isin, ticker)', default: 'isin' },
				updated_after: {
					type: 'string',
					description: 'Only return data updated after this date (ISO string)',
				},
			},
			required: ['identifier'],
		},
	},
	{
		name: 'add_market_data',
		description: 'Cache market data for an investment',
		inputSchema: {
			type: 'object',
			properties: {
				identifier: { type: 'string', description: 'ISIN or ticker symbol' },
				id_type: { type: 'string', description: 'Identifier type' },
				data: { type: 'object', description: 'Market data to cache' },
			},
			required: ['identifier', 'id_type', 'data'],
		},
	},
	{
		name: 'report_isin_error',
		description: 'Report an error with ISIN lookup',
		inputSchema: {
			type: 'object',
			properties: {
				identifier: { type: 'string', description: 'ISIN that caused error' },
				error: { type: 'object', description: 'Error details' },
			},
			required: ['identifier', 'error'],
		},
	},

	// Financial calculation tools
	{
		name: 'calculate_portfolio_projection',
		description: 'Calculate complete portfolio projection with all investments over time',
		inputSchema: {
			type: 'object',
			properties: {
				portfolio_id: { type: 'number', description: 'Portfolio ID to calculate projections for' },
			},
			required: ['portfolio_id'],
		},
	},
	{
		name: 'calculate_investment_projection',
		description: 'Calculate projection for a single investment',
		inputSchema: {
			type: 'object',
			properties: {
				investment_id: { type: 'number', description: 'Investment ID to calculate projection for' },
			},
			required: ['investment_id'],
		},
	},
	{
		name: 'get_current_portfolio_value',
		description: 'Get the current total value of a portfolio as of today',
		inputSchema: {
			type: 'object',
			properties: {
				portfolio_id: { type: 'number', description: 'Portfolio ID to get current value for' },
			},
			required: ['portfolio_id'],
		},
	},
	{
		name: 'evaluate_withdrawal_scenario',
		description: 'Test a modified withdrawal scenario and compare with baseline',
		inputSchema: {
			type: 'object',
			properties: {
				investment_id: { type: 'number', description: 'Investment ID to modify' },
				new_withdrawal_amount: { type: 'number', description: 'New monthly withdrawal amount' },
				start_date: { type: 'string', description: 'Withdrawal start date (YYYY-MM-DD)' },
				end_date: { type: 'string', description: 'Withdrawal end date (YYYY-MM-DD, optional)' },
			},
			required: ['investment_id', 'new_withdrawal_amount', 'start_date'],
		},
	},
	{
		name: 'compare_investment_scenarios',
		description: 'Compare baseline vs modified investment parameters (APY, fees, etc.)',
		inputSchema: {
			type: 'object',
			properties: {
				investment_id: { type: 'number', description: 'Investment ID to modify' },
				modifications: {
					type: 'object',
					description: 'Investment parameters to modify',
					properties: {
						apy: { type: 'number', description: 'New APY rate (as percentage, e.g., 7.2)' },
						management_fee: { type: 'number', description: 'New management fee (as percentage)' },
						ter: { type: 'number', description: 'New TER fee (as percentage)' },
						success_fee: { type: 'number', description: 'New success fee (as percentage)' },
						entry_fee: { type: 'number', description: 'New entry fee (as percentage)' },
						exit_fee: { type: 'number', description: 'New exit fee (as percentage)' },
					},
				},
			},
			required: ['investment_id', 'modifications'],
		},
	},
]

// Helper function to create authenticated Supabase client from locals
// Creates a Supabase client with the user's auth session so RLS policies work correctly
async function createAuthenticatedSupabase(locals: App.Locals) {
	if (!locals.user) {
		throw new Error('No authenticated user found')
	}

	// Generate an auth token for this user using the service role
	const { data, error } = await serviceAdapter.generateAuthLink(locals.user.email!)

	if (error || !data?.properties?.action_link) {
		throw new Error(`Failed to generate auth session: ${error?.message}`)
	}

	// Extract the token from the magic link
	const url = new URL(data.properties.action_link)
	const token = url.searchParams.get('token')

	if (!token) {
		throw new Error('Failed to extract token from auth link')
	}

	// Create a Supabase client and verify the OTP token
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
	const supabaseAdapter = new SupabaseAdapter(supabase)

	const { data: sessionData, error: sessionError } = await supabaseAdapter.verifyOtp(
		token,
		'magiclink',
	)

	if (sessionError || !sessionData?.session) {
		throw new Error(`Failed to create session: ${sessionError?.message}`)
	}

	// Set the session on the client
	await supabaseAdapter.setSession(sessionData.session)

	return { supabase, user: locals.user }
}

// Helper function to create authenticated adapter from locals
async function createAuthenticatedAdapter(locals: App.Locals): Promise<Adapter> {
	const { supabase } = await createAuthenticatedSupabase(locals)
	return new SupabaseAdapter(supabase)
}

async function handleToolCall(
	name: string,
	args: Record<string, unknown>,
	locals: App.Locals,
): Promise<MCPResponse> {
	try {
		// Create authenticated adapter once for all tools
		const authenticatedAdapter = await createAuthenticatedAdapter(locals)

		switch (name) {
			// ChatGPT required tools
			case 'search': {
				const parsed = z
					.object({
						query: z.string().optional(),
						entity_type: z.enum(['client', 'portfolio', 'investment', 'all']).optional(),
						limit: z.number().optional(),
						list_all: z.boolean().optional(),
					})
					.parse(args)

				const listAll = parsed.list_all || false
				const query = parsed.query?.toLowerCase() || ''
				const entityType = parsed.entity_type || 'all'
				const limit = parsed.limit || 10
				const results: Array<{ id: number; type: string; name: string; description: string }> = []

				// Validate: if list_all is true, entity_type must be specified
				if (listAll && entityType === 'all') {
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										error:
											'When list_all is true, entity_type must be specified (client, portfolio, or investment)',
									},
									null,
									2,
								),
							},
						],
						isError: true,
					}
				}

				// Search clients
				if (entityType === 'all' || entityType === 'client') {
					const clients = await authenticatedAdapter.getClients()
					for (const client of clients) {
						if (
							listAll ||
							client.name.toLowerCase().includes(query) ||
							client.email.toLowerCase().includes(query)
						) {
							results.push({
								id: client.id,
								type: 'client',
								name: client.name,
								description: `Client - ${client.email}`,
							})
						}
					}
				}

				// Search portfolios across all clients
				if (entityType === 'all' || entityType === 'portfolio') {
					const clients = await authenticatedAdapter.getClients()
					for (const client of clients) {
						const portfolios = await authenticatedAdapter.getPortfolios(client.id)
						for (const portfolio of portfolios) {
							if (
								listAll ||
								portfolio.name.toLowerCase().includes(query) ||
								portfolio.link?.toLowerCase().includes(query)
							) {
								results.push({
									id: portfolio.id,
									type: 'portfolio',
									name: portfolio.name,
									description: `Portfolio for ${client.name}`,
								})
							}
						}
					}
				}

				// Search investments across all portfolios
				if (entityType === 'all' || entityType === 'investment') {
					const clients = await authenticatedAdapter.getClients()
					for (const client of clients) {
						const portfolios = await authenticatedAdapter.getPortfolios(client.id)
						for (const portfolio of portfolios) {
							const investments = await authenticatedAdapter.getInvestments(portfolio.id)
							for (const investment of investments) {
								if (listAll || investment.name.toLowerCase().includes(query)) {
									results.push({
										id: investment.id,
										type: 'investment',
										name: investment.name,
										description: `Investment in ${portfolio.name}`,
									})
								}
							}
						}
					}
				}

				// Return top results
				const topResults = results.slice(0, limit)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									query: parsed.query || '(list all)',
									list_all: listAll,
									entity_type: entityType,
									results: topResults,
									total_found: results.length,
									returned: topResults.length,
								},
								null,
								2,
							),
						},
					],
				}
			}

			case 'fetch': {
				const parsed = z
					.object({
						entity_type: z.enum(['client', 'portfolio', 'investment', 'transaction']),
						id: z.number(),
					})
					.parse(args)

				let result

				switch (parsed.entity_type) {
					case 'client': {
						const clients = await authenticatedAdapter.getClients()
						result = clients.find((c) => c.id === parsed.id)
						if (!result) {
							throw new Error(`Client with ID ${parsed.id} not found`)
						}
						// Include portfolios for the client
						const portfolios = await authenticatedAdapter.getPortfolios(parsed.id)
						result = { ...result, portfolios }
						break
					}
					case 'portfolio': {
						result = await authenticatedAdapter.getPortfolio(parsed.id)
						if (!result) {
							throw new Error(`Portfolio with ID ${parsed.id} not found`)
						}
						// Include investments for the portfolio
						const investments = await authenticatedAdapter.getInvestments(parsed.id)
						result = { ...result, investments }
						break
					}
					case 'investment': {
						result = await authenticatedAdapter.getInvestment(parsed.id)
						if (!result) {
							throw new Error(`Investment with ID ${parsed.id} not found`)
						}
						// Include transactions for the investment
						const transactions = await authenticatedAdapter.getTransactions(parsed.id)
						result = { ...result, transactions }
						break
					}
					case 'transaction': {
						result = await authenticatedAdapter.getTransaction(parsed.id)
						if (!result) {
							throw new Error(`Transaction with ID ${parsed.id} not found`)
						}
						break
					}
				}

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			}

			// Client management
			case 'get_clients': {
				const clients = await authenticatedAdapter.getClients()
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(clients, null, 2),
						},
					],
				}
			}

			case 'add_client': {
				const parsed = addClientArgsSchema.parse(args)
				const clientData: ClientNoId = {
					name: parsed.name,
					birth_date: parsed.birth_date,
					email: parsed.email || '',
				}
				const clientId = await authenticatedAdapter.addClient(clientData)
				return {
					content: [{ type: 'text', text: `Client created successfully with ID: ${clientId}` }],
				}
			}

			case 'update_client': {
				const parsed = updateClientArgsSchema.parse(args)
				const { id, name, email, birth_date } = parsed
				const updateData = {
					id,
					...(name ? { name } : {}),
					...(email ? { email } : {}),
					...(birth_date ? { birth_date } : {}),
				}
				await authenticatedAdapter.updateClient(updateData)
				return { content: [{ type: 'text', text: `Client ${id} updated successfully` }] }
			}

			case 'delete_client': {
				const parsed = idSchema.parse(args)
				await authenticatedAdapter.deleteClient({ id: parsed.id })
				return { content: [{ type: 'text', text: `Client ${parsed.id} deleted successfully` }] }
			}

			// Portfolio management
			case 'get_portfolios': {
				const parsed = clientIdSchema.parse(args)
				const portfolios = await authenticatedAdapter.getPortfolios(parsed.client_id)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(portfolios, null, 2),
						},
					],
				}
			}

			case 'add_portfolio': {
				const parsed = addPortfolioArgsSchema.parse(args)
				const portfolioData = {
					client: parsed.client_id,
					name: parsed.name,
					start_date: parsed.start_date,
					end_date: parsed.end_date ?? null,
					currency: parsed.currency || 'CZK',
					inflation_rate: parsed.inflation_rate || 0.03,
					link: null,
				}
				const portfolioId = await authenticatedAdapter.addPortfolio(portfolioData)
				return {
					content: [
						{ type: 'text', text: `Portfolio created successfully with ID: ${portfolioId}` },
					],
				}
			}

			case 'update_portfolio': {
				const parsed = updatePortfolioArgsSchema.parse(args)

				const portfolioUpdate: Partial<Portfolio> & Pick<Portfolio, 'id'> = {
					id: parsed.id,
					...(parsed.client_id ? { client: parsed.client_id } : {}),
					...(parsed.name ? { name: parsed.name } : {}),
					...(parsed.start_date ? { start_date: parsed.start_date } : {}),
					...(parsed.end_date ? { end_date: parsed.end_date } : {}),
					...(parsed.currency ? { currency: parsed.currency } : {}),
					...(parsed.inflation_rate ? { inflation_rate: parsed.inflation_rate } : {}),
				}
				await authenticatedAdapter.updatePortfolio(portfolioUpdate)
				return {
					content: [{ type: 'text', text: `Portfolio ${parsed.id} updated successfully` }],
				}
			}

			case 'delete_portfolio': {
				const parsed = idSchema.parse(args)
				await authenticatedAdapter.deletePortfolio({ id: parsed.id })
				return { content: [{ type: 'text', text: `Portfolio ${parsed.id} deleted successfully` }] }
			}

			case 'duplicate_portfolio': {
				const parsed = duplicatePortfolioArgsSchema.parse(args)

				try {
					// Note: cascadeDuplicatePortfolio relies on client-side stores, so we implement server-side duplication
					// Get the original portfolio
					const originalPortfolio = await authenticatedAdapter.getPortfolio(parsed.portfolio_id)
					if (!originalPortfolio) {
						return {
							content: [{ type: 'text', text: `Portfolio ${parsed.portfolio_id} not found` }],
							isError: true,
						}
					}

					// Create duplicated portfolio with a new link ID
					const linkId = `${originalPortfolio.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-copy-${Date.now()}`
					const duplicatedPortfolio = {
						...originalPortfolio,
						id: undefined,
						link: linkId,
						name: parsed.new_name,
					}

					const duplicatedPortfolioId = await authenticatedAdapter.addPortfolio(duplicatedPortfolio)

					// Get and duplicate investments
					const investments = await authenticatedAdapter.getInvestments(parsed.portfolio_id)
					for (const investment of investments) {
						const duplicatedInvestment = {
							...investment,
							id: undefined,
							portfolio_id: duplicatedPortfolioId,
						}
						const duplicatedInvestmentId =
							await authenticatedAdapter.addInvestment(duplicatedInvestment)

						// Get and duplicate transactions for this investment
						const transactions = await authenticatedAdapter.getTransactions(investment.id)
						for (const transaction of transactions) {
							const duplicatedTransaction = {
								...transaction,
								id: undefined,
								investment_id: duplicatedInvestmentId,
							}
							await authenticatedAdapter.addTransaction(duplicatedTransaction)
						}
					}

					return {
						content: [
							{
								type: 'text',
								text: `Portfolio duplicated successfully with ID: ${duplicatedPortfolioId}`,
							},
						],
					}
				} catch (error) {
					return {
						content: [
							{
								type: 'text',
								text: `Failed to duplicate portfolio: ${error instanceof Error ? error.message : String(error)}`,
							},
						],
						isError: true,
					}
				}
			}

			case 'get_portfolio_view': {
				const parsed = idSchema.parse(args)
				const portfolioView = await authenticatedAdapter.portfolioView(String(parsed.id))
				if (!portfolioView) {
					return {
						content: [{ type: 'text', text: `Portfolio ${parsed.id} not found` }],
						isError: true,
					}
				}
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(portfolioView, null, 2),
						},
					],
				}
			}

			// Investment management
			case 'get_investments': {
				const parsed = portfolioIdSchema.parse(args)
				const investments = await authenticatedAdapter.getInvestments(parsed.portfolio_id)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(investments, null, 2),
						},
					],
				}
			}

			case 'add_investment': {
				const parsed = addInvestmentArgsSchema.parse(args)

				const investmentData = {
					portfolio_id: parsed.portfolio_id,
					name: parsed.name,
					apy: parsed.apy ?? null,
					management_fee: parsed.management_fee || 0,
					management_fee_type: 'percentage',
					success_fee: parsed.success_fee || 0,
					ter: parsed.ter || 0,
					entry_fee: parsed.entry_fee || 0,
					entry_fee_type: 'percentage',
					exit_fee: parsed.exit_fee || 0,
					exit_fee_type: 'percentage',
					advanced_fees: parsed.advanced_fees || false,
					type: parsed.type || 'investment',
				}
				const investmentId = await authenticatedAdapter.addInvestment(investmentData)
				return {
					content: [
						{ type: 'text', text: `Investment created successfully with ID: ${investmentId}` },
					],
				}
			}

			case 'update_investment': {
				const parsed = updateInvestmentArgsSchema.parse(args)
				const { id, ...updateData } = parsed

				await authenticatedAdapter.updateInvestment({ id, ...updateData })
				return { content: [{ type: 'text', text: `Investment ${id} updated successfully` }] }
			}

			case 'delete_investment': {
				const parsed = idSchema.parse(args)
				await authenticatedAdapter.deleteInvestment({ id: parsed.id })
				return { content: [{ type: 'text', text: `Investment ${parsed.id} deleted successfully` }] }
			}

			// Transaction management
			case 'get_transactions': {
				const parsed = investmentIdSchema.parse(args)
				const transactions = await authenticatedAdapter.getTransactions(parsed.investment_id)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(transactions, null, 2),
						},
					],
				}
			}

			case 'add_transaction': {
				const parsed = addTransactionArgsSchema.parse(args)

				const transactionData = {
					investment_id: parsed.investment_id,
					type: parsed.type,
					amount: parsed.amount,
					date: parsed.date,
					end_date: parsed.end_date ?? null,
					repeat_unit: parsed.repeat_unit ?? null,
					repeat: parsed.repeat ?? null,
					label: parsed.label ?? null,
					inflation_adjusted: parsed.inflation_adjusted ?? false,
				}
				const transactionId = await authenticatedAdapter.addTransaction(transactionData)
				return {
					content: [
						{ type: 'text', text: `Transaction created successfully with ID: ${transactionId}` },
					],
				}
			}

			case 'update_transaction': {
				const parsed = updateTransactionArgsSchema.parse(args)
				const {
					id,
					investment_id,
					type,
					amount,
					date,
					end_date,
					repeat_unit,
					repeat,
					label,
					inflation_adjusted,
				} = parsed

				const updateData = {
					id,
					date,
					...(investment_id ? { investment_id } : {}),
					...(type ? { type } : {}),
					...(amount ? { amount } : {}),
					...(end_date ? { end_date } : {}),
					...(repeat_unit ? { repeat_unit } : {}),
					...(repeat ? { repeat } : {}),
					...(label ? { label } : {}),
					...(inflation_adjusted ? { inflation_adjusted } : {}),
				}
				await authenticatedAdapter.updateTransaction(updateData)
				return { content: [{ type: 'text', text: `Transaction ${id} updated successfully` }] }
			}

			case 'delete_transaction': {
				const parsed = idSchema.parse(args)
				await authenticatedAdapter.deleteTransaction({ id: parsed.id })
				return {
					content: [{ type: 'text', text: `Transaction ${parsed.id} deleted successfully` }],
				}
			}

			// Market data
			case 'get_market_data': {
				const parsed = identifierSchema.parse(args)
				const updatedAfter = parsed.updated_after ? new Date(parsed.updated_after) : undefined
				const marketData = await authenticatedAdapter.getMarketData(
					parsed.identifier,
					parsed.id_type || 'isin',
					updatedAfter,
				)
				if (!marketData) {
					return {
						content: [{ type: 'text', text: `No market data found for ${parsed.identifier}` }],
						isError: true,
					}
				}
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(marketData, null, 2),
						},
					],
				}
			}

			case 'add_market_data': {
				const parsed = addMarketDataArgsSchema.parse(args)
				await authenticatedAdapter.addMarketData(
					parsed.identifier,
					parsed.id_type,
					parsed.data as object,
				)
				return {
					content: [
						{
							type: 'text',
							text: `Market data cached successfully for ${parsed.identifier}`,
						},
					],
				}
			}

			case 'report_isin_error': {
				const parsed = reportErrorArgsSchema.parse(args)
				await authenticatedAdapter.addISINError(parsed.identifier, parsed.error as object)
				return {
					content: [{ type: 'text', text: `ISIN error reported for ${parsed.identifier}` }],
				}
			}

			// Financial calculation tools
			case 'calculate_portfolio_projection': {
				const parsed = portfolioIdSchema.parse(args)

				// Get portfolio
				const portfolio = await authenticatedAdapter.getPortfolio(parsed.portfolio_id)
				if (!portfolio) {
					throw new Error(`Portfolio not found with ID: ${parsed.portfolio_id}`)
				}

				// Get investments for this portfolio
				const investments = await authenticatedAdapter.getInvestments(parsed.portfolio_id)

				// Get all transactions for these investments
				const allTransactions: Transaction[] = []
				for (const investment of investments) {
					const transactions = await authenticatedAdapter.getTransactions(investment.id)
					allTransactions.push(...transactions)
				}

				const scenario: PortfolioScenario = {
					portfolio,
					investments,
					transactions: allTransactions,
				}

				const result = calculatePortfolioProjection(scenario)

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			}

			case 'calculate_investment_projection': {
				const parsed = z.object({ investment_id: z.number() }).parse(args)

				// Get the investment using adapter
				const investment = await authenticatedAdapter.getInvestment(parsed.investment_id)
				if (!investment) {
					throw new Error(`Investment ${parsed.investment_id} not found`)
				}

				// Get transactions for this investment using adapter
				const transactions = await authenticatedAdapter.getTransactions(parsed.investment_id)

				const scenario: InvestmentScenario = {
					investment,
					transactions,
				}

				const result = calculateInvestmentProjection(scenario)

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			}

			case 'get_current_portfolio_value': {
				const parsed = portfolioIdSchema.parse(args)

				// Get investments for this portfolio using adapter
				const investments = await authenticatedAdapter.getInvestments(parsed.portfolio_id)

				// Get all transactions for these investments using adapter
				const allTransactions: Transaction[] = []
				for (const investment of investments) {
					const transactions = await authenticatedAdapter.getTransactions(investment.id)
					allTransactions.push(...transactions)
				}

				const currentValue = getCurrentPortfolioValueService(investments, allTransactions)

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									portfolio_id: parsed.portfolio_id,
									current_value: currentValue,
									calculated_date: new Date().toISOString(),
								},
								null,
								2,
							),
						},
					],
				}
			}

			case 'evaluate_withdrawal_scenario': {
				const parsed = z
					.object({
						investment_id: z.number(),
						new_withdrawal_amount: z.number(),
						start_date: z.string(),
						end_date: z.string().optional(),
					})
					.parse(args)

				// Get the investment using adapter
				const investment = await authenticatedAdapter.getInvestment(parsed.investment_id)
				if (!investment) {
					throw new Error(`Investment ${parsed.investment_id} not found`)
				}

				// Get the portfolio using adapter
				const portfolio = await authenticatedAdapter.getPortfolio(investment.portfolio_id)
				if (!portfolio) {
					throw new Error(`Portfolio not found with ID: ${investment.portfolio_id}`)
				}

				// Get all investments in the portfolio using adapter
				const allInvestments = await authenticatedAdapter.getInvestments(investment.portfolio_id)

				// Get all transactions for all investments using adapter
				const allTransactions: Transaction[] = []
				for (const inv of allInvestments) {
					const transactions = await authenticatedAdapter.getTransactions(inv.id)
					allTransactions.push(...transactions)
				}

				// Create baseline scenario
				const baselineScenario: PortfolioScenario = {
					portfolio,
					investments: allInvestments,
					transactions: allTransactions,
				}

				// Create modified scenario with new withdrawal
				const modifiedTransactions = allTransactions.filter(
					(t) => t.investment_id !== parsed.investment_id || t.type !== 'withdrawal',
				)

				// Add new withdrawal transaction
				modifiedTransactions.push({
					id: -1, // Temporary ID for calculation
					investment_id: parsed.investment_id,
					type: 'withdrawal',
					amount: parsed.new_withdrawal_amount,
					date: parsed.start_date,
					end_date: parsed.end_date ?? null,
					repeat: 1,
					repeat_unit: 'month',
					label: 'Modified Withdrawal Scenario',
					created_at: '',
					last_edited_at: '',
				} as Transaction)

				const modifiedScenario: PortfolioScenario = {
					portfolio,
					investments: allInvestments,
					transactions: modifiedTransactions,
				}

				const comparison = compareScenarios(baselineScenario, modifiedScenario)

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(comparison, null, 2),
						},
					],
				}
			}

			case 'compare_investment_scenarios': {
				const parsed = z
					.object({
						investment_id: z.number(),
						modifications: z
							.object({
								apy: z.number().optional(),
								management_fee: z.number().optional(),
								ter: z.number().optional(),
								success_fee: z.number().optional(),
								entry_fee: z.number().optional(),
								exit_fee: z.number().optional(),
							})
							.optional(),
					})
					.parse(args)

				// Get the investment using adapter
				const investment = await authenticatedAdapter.getInvestment(parsed.investment_id)
				if (!investment) {
					throw new Error(`Investment ${parsed.investment_id} not found`)
				}

				// Get the portfolio using adapter
				const portfolio = await authenticatedAdapter.getPortfolio(investment.portfolio_id)
				if (!portfolio) {
					throw new Error(`Portfolio not found with ID: ${investment.portfolio_id}`)
				}

				// Get all investments in the portfolio using adapter
				const allInvestments = await authenticatedAdapter.getInvestments(investment.portfolio_id)

				// Get all transactions for all investments using adapter
				const allTransactions: Transaction[] = []
				for (const inv of allInvestments) {
					const transactions = await authenticatedAdapter.getTransactions(inv.id)
					allTransactions.push(...transactions)
				}

				// Create baseline scenario
				const baselineScenario: PortfolioScenario = {
					portfolio,
					investments: allInvestments,
					transactions: allTransactions,
				}

				// Create modified scenario with updated investment parameters
				const modifiedInvestments = (allInvestments as Investment[]).map((inv) => {
					if (inv.id === parsed.investment_id) {
						return {
							...inv,
							...(parsed.modifications as object),
						}
					}
					return inv
				})

				const modifiedScenario: PortfolioScenario = {
					portfolio,
					investments: modifiedInvestments,
					transactions: allTransactions,
				}

				const comparison = compareScenarios(baselineScenario, modifiedScenario)

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(comparison, null, 2),
						},
					],
				}
			}

			default:
				return {
					content: [{ type: 'text', text: `Unknown tool: ${name}` }],
					isError: true,
				}
		}
	} catch (error) {
		console.error(`Error executing tool ${name}:`, error)
		return {
			content: [
				{
					type: 'text',
					text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		}
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const method = url.searchParams.get('method')

	if (method === 'tools/list') {
		return json({
			tools: TOOLS,
		})
	}

	return json({
		name: 'kalkul-financial-planning',
		version: '1.0.0',
		description: 'MCP server for Kalkul financial planning database operations',
		tools: TOOLS.length,
		usage:
			'GET ?method=tools/list for available tools, POST with JSON-RPC style requests for tool execution',
	})
}

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = (await request.json()) as JsonRpcRequest

		// Validate JSON-RPC 2.0 format
		if (body.jsonrpc !== '2.0') {
			return json(
				{
					jsonrpc: '2.0',
					id: body.id,
					error: {
						code: -32600,
						message: 'Invalid Request: jsonrpc must be "2.0"',
					},
				} as JsonRpcResponse,
				{ status: 400 },
			)
		}

		// Handle initialize method (MCP handshake)
		if (body.method === 'initialize') {
			// Client sends protocolVersion, capabilities, and clientInfo
			// We accept them but return our own server capabilities
			return json({
				jsonrpc: '2.0',
				id: body.id,
				result: {
					protocolVersion: '2024-11-05',
					capabilities: {
						tools: {
							listChanged: false,
						},
					},
					serverInfo: {
						name: 'kalkul-financial-planning',
						version: '1.0.0',
					},
				},
			} as JsonRpcResponse)
		}

		// Handle initialized notification (completes handshake)
		if (body.method === 'notifications/initialized') {
			// Notifications don't have responses, but we return 202 Accepted
			return new Response(undefined, { status: 202 })
		}

		// Handle tools/list method
		if (body.method === 'tools/list') {
			return json({
				jsonrpc: '2.0',
				id: body.id,
				result: {
					tools: TOOLS,
				},
			} as JsonRpcResponse)
		}

		// Handle tools/call method
		if (body.method === 'tools/call') {
			const params = body.params as {
				name: string
				arguments: Record<string, unknown>
			}

			if (!params?.name || !params?.arguments) {
				return json(
					{
						jsonrpc: '2.0',
						id: body.id,
						error: {
							code: -32602,
							message: 'Invalid params: name and arguments are required for tools/call',
						},
					} as JsonRpcResponse,
					{ status: 400 },
				)
			}

			const response = await handleToolCall(params.name, params.arguments, locals)

			// Return JSON-RPC response format
			if (response.isError) {
				return json({
					jsonrpc: '2.0',
					id: body.id,
					error: {
						code: -32000,
						message: response.error?.message || 'Tool execution failed',
						data: response.content,
					},
				} as JsonRpcResponse)
			}

			return json({
				jsonrpc: '2.0',
				id: body.id,
				result: response,
			} as JsonRpcResponse)
		}

		// Unknown method
		return json(
			{
				jsonrpc: '2.0',
				id: body.id,
				error: {
					code: -32601,
					message: `Method not found: ${body.method}`,
				},
			} as JsonRpcResponse,
			{ status: 404 },
		)
	} catch (error) {
		console.error('MCP server error:', error)
		return json(
			{
				jsonrpc: '2.0',
				id: undefined,
				error: {
					code: -32603,
					message: error instanceof Error ? error.message : 'Internal error',
				},
			} as JsonRpcResponse,
			{ status: 500 },
		)
	}
}
