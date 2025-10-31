#!/usr/bin/env tsx

/**
 * MCP POST script - makes HTTP requests to the MCP server
 * Usage: KALKUL_TOKEN=kalkul_xxx tsx scripts/mcp-post.ts <method> [arguments]
 *
 * Environment Variables:
 * - KALKUL_TOKEN: Personal Access Token for authentication (required)
 * - MCP_URL: MCP server URL (optional, defaults to local)
 *
 * Arguments:
 * - method: The MCP method to call (e.g., "get_clients", "get_portfolio_view")
 * - arguments: Optional JSON string with method arguments
 */

const MCP_URL = process.env.MCP_URL || 'http://localhost:5173/api/mcp'
const KALKUL_TOKEN = process.env.KALKUL_TOKEN

async function main() {
	const args = process.argv.slice(2)

	if (!KALKUL_TOKEN) {
		console.error('Error: KALKUL_TOKEN environment variable is required')
		console.error('Usage: KALKUL_TOKEN=kalkul_xxx tsx scripts/mcp-post.ts <method> [arguments]')
		console.error('')
		console.error('Get your token from: http://localhost:5173/api-tokens')
		process.exit(1)
	}

	if (args.length === 0) {
		console.error('Usage: KALKUL_TOKEN=kalkul_xxx tsx scripts/mcp-post.ts <method> [arguments]')
		console.error('Examples:')
		console.error('  KALKUL_TOKEN=kalkul_xxx tsx scripts/mcp-post.ts get_clients')
		console.error(
			'  KALKUL_TOKEN=kalkul_xxx tsx scripts/mcp-post.ts get_portfolio_view \'{"id": "dubois-retraite-plan-2025"}\'',
		)
		console.error(
			'  KALKUL_TOKEN=kalkul_xxx tsx scripts/mcp-post.ts calculate_portfolio_projection \'{"portfolio_id": "4"}\'',
		)
		process.exit(1)
	}

	const method = args[0]
	let methodArgs: Record<string, unknown> = {}

	// Parse additional arguments if provided
	if (args.length > 1) {
		try {
			methodArgs = JSON.parse(args[1])
		} catch (error) {
			console.error('Error parsing arguments JSON:', error)
			process.exit(1)
		}
	}

	const payload = {
		method: 'tools/call',
		params: {
			name: method,
			arguments: methodArgs,
		},
	}

	try {
		console.log('Sending request to:', MCP_URL)
		console.log('Method:', method)
		console.log('Arguments:', JSON.stringify(methodArgs, null, 2))
		console.log()

		const response = await fetch(MCP_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${KALKUL_TOKEN}`,
			},
			body: JSON.stringify(payload),
		})

		const responseText = await response.text()

		if (!response.ok) {
			console.error('HTTP Error:', response.status, response.statusText)
			console.error('Response:', responseText)
			process.exit(1)
		}

		try {
			const responseJson = JSON.parse(responseText)
			console.log('Response:', JSON.stringify(responseJson, null, 2))
		} catch {
			console.log('Response:', responseText)
		}
	} catch (error) {
		console.error('Error making request:', error)
		process.exit(1)
	}
}

main()
