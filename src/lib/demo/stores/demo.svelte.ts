import { formatDate } from '$lib/@snaha/kalkul-maths'
import {
	calculateRequiredDeposit,
	type RetirementCalculationInput,
} from '$lib/@snaha/kalkul-calculators/retirement/retirement'
import type { Portfolio, Investment, Transaction, InvestmentWithColorIndex } from '$lib/types'
import type { PortfolioSimulation } from '$lib/stores/portfolio-simulation.svelte'
import { _ } from 'svelte-i18n'
import { get } from 'svelte/store'

// Import state data for demo states
import { getState1Data } from '$lib/demo/data/1-goal-only-state'
import { getState2Data } from '$lib/demo/data/2-single-investment-state'
import { getState3Data } from '$lib/demo/data/3-equal-investments-state'
import { getState4Data } from '$lib/demo/data/4-final-state'
import { getState5Data } from '$lib/demo/data/5-two-goals-state'

export const RETIREMENT_DEFAULTS = {
	RETIREMENT_AGE: 65,
	RETIREMENT_LENGTH: 20,
	CURRENCY: 'CZK',
	INFLATION: 2.5,
	DESIRED_BUDGET: 0,
	BUDGET_PERIOD: 'month' as const,
	CURRENT_SAVINGS: 0,
	APY: 5.5,
	DEPOSIT_PERIOD: 'month' as const,
}

export type LinkedInvestment = {
	investmentId: number
	percentage: number
}

export type RetirementGoal = {
	type: 'retirement'
	calculationInput: RetirementCalculationInput
	currency: string
	customDepositAmount?: number
	linkedInvestments: LinkedInvestment[]
}

export type EducationGoal = {
	type: 'education'
	calculationInput: RetirementCalculationInput
	currency: string
	customDepositAmount?: number
	linkedInvestments: LinkedInvestment[]
}

export type Goal = RetirementGoal | EducationGoal

export function goalToTransactions(goal: Goal): Transaction[] {
	// Convert goal to a series of transactions
	if (goal.type === 'retirement' || goal.type === 'education') {
		const transactions: Transaction[] = []
		const g = goal

		// Add initial deposit if any
		if (g.calculationInput.currentSavings > 0) {
			transactions.push({
				id: -1, // Demo ID
				investment_id: -1, // Demo investment ID
				amount: g.calculationInput.currentSavings,
				date: formatDate(g.calculationInput.depositStart),
				type: 'deposit',
				created_at: new Date().toISOString(),
				last_edited_at: new Date().toISOString(),
				end_date: null,
				inflation_adjusted: false, // Current savings is today's money, not future
				label: get(_)('demo.transactions.initialSavings'),
				repeat: null,
				repeat_unit: null,
			})
		}
		// Add regular deposits until retirement/education
		const amount = g.customDepositAmount ?? calculateRequiredDeposit(g.calculationInput)
		transactions.push({
			id: -2, // Demo ID
			investment_id: -1, // Demo investment ID
			amount,
			date: formatDate(g.calculationInput.depositStart),
			type: 'deposit',
			created_at: new Date().toISOString(),
			last_edited_at: new Date().toISOString(),
			end_date: formatDate(g.calculationInput.retirementStart),
			inflation_adjusted: true,
			label: get(_)('demo.transactions.regularDeposit'),
			repeat: 1,
			repeat_unit: g.calculationInput.depositPeriod === 'month' ? 'month' : 'year',
		})

		// Add withdrawals during retirement/education
		const withdrawalLabel =
			goal.type === 'education'
				? get(_)('demo.transactions.educationWithdrawal')
				: get(_)('demo.transactions.retirementWithdrawal')
		transactions.push({
			id: -3, // Demo ID
			investment_id: -1, // Demo investment ID
			amount: g.calculationInput.desiredBudget,
			date: formatDate(g.calculationInput.retirementStart),
			type: 'withdrawal',
			created_at: new Date().toISOString(),
			last_edited_at: new Date().toISOString(),
			end_date: formatDate(
				new Date(
					g.calculationInput.retirementStart.getFullYear() + g.calculationInput.retirementLength,
					g.calculationInput.retirementStart.getMonth(),
					g.calculationInput.retirementStart.getDate(),
				),
			),
			inflation_adjusted: true,
			label: withdrawalLabel,
			repeat: 1,
			repeat_unit: g.calculationInput.budgetPeriod === 'month' ? 'month' : 'year',
		})

		return transactions
	}
	return []
}

export function goalToInvestment(goal: Goal): InvestmentWithColorIndex {
	// Convert goal to a demo investment
	const name =
		goal.type === 'retirement'
			? get(_)('demo.investments.retirement')
			: goal.type === 'education'
				? get(_)('demo.investments.education')
				: 'Goal'
	return {
		id: -1, // Demo ID
		portfolio_id: -1, // Demo portfolio ID
		name,
		apy: goal.calculationInput.apy,
		type: 'goal',
		created_at: new Date().toISOString(),
		last_edited_at: new Date().toISOString(),
		advanced_fees: false,
		entry_fee: null,
		entry_fee_type: null,
		exit_fee: null,
		exit_fee_type: null,
		management_fee: null,
		management_fee_type: null,
		success_fee: null,
		ter: null,
		colorIndex: 4, // Use the fifth color from SERIES_COLORS
	}
}

export type DemoState = 1 | 2 | 3 | 4 | 5

/**
 * Complete state data structure for all demo states
 */
type DemoStateData = {
	goals: Goal[]
	investments: InvestmentWithColorIndex[]
	transactions: Transaction[]
	transactionGoalMap: Map<number, string>
	graphData: PortfolioSimulation
	goalsGraphData?: PortfolioSimulation
	goalInvestments: InvestmentWithColorIndex[]
	goalTransactions: Transaction[]
}

class DemoStore {
	goals = $state<Goal[]>([])

	// Demo data for goals page - empty arrays, no DB fetching
	portfolio = $state<Portfolio | undefined>(undefined)
	investments = $state<Investment[]>([])
	transactions = $state<Transaction[]>([])
	transactionGoalMap = $state<Map<number, string>>(new Map())

	// Derived data for portfolio visualization
	graphData = $state<PortfolioSimulation | undefined>(undefined)
	goalsGraphData = $state<PortfolioSimulation | undefined>(undefined)
	goalInvestments = $state<InvestmentWithColorIndex[]>([])
	goalTransactions = $state<Transaction[]>([])

	// Track the current demo state (1: goal only, 2: single investment, 3: equal weights, 4: custom weights)
	demoState = $state<DemoState>(1)

	addGoal(goal: Goal) {
		this.goals.push(goal)
	}

	removeGoal(index: number) {
		if (index >= 0 && index < this.goals.length) {
			this.goals.splice(index, 1)
		}
	}

	setCustomDepositAmount(amount: number) {
		const goal = this.goals[0]
		if (goal && goal.type === 'retirement') {
			goal.customDepositAmount = amount
		}
	}

	clear() {
		this.goals = []
	}

	addInvestment() {
		// In demo mode, transition to state 2 (single investment state)
		this.setState(2)
	}

	linkInvestmentToGoal(goalIndex: number, investmentId: number) {
		const goal = this.goals[goalIndex]
		if (!goal) return

		// Add the investment if not already linked
		if (!goal.linkedInvestments.find((li) => li.investmentId === investmentId)) {
			goal.linkedInvestments.push({
				investmentId,
				percentage: 0,
			})
		}

		// Recalculate percentages to distribute evenly
		this.recalculateInvestmentPercentages(goalIndex)

		// Regenerate transactions after linking
		this.regenerateAllTransactions()
	}

	unlinkInvestmentFromGoal(goalIndex: number, investmentId: number) {
		const goal = this.goals[goalIndex]
		if (!goal) return

		const index = goal.linkedInvestments.findIndex((li) => li.investmentId === investmentId)
		if (index !== -1) {
			goal.linkedInvestments.splice(index, 1)
			this.recalculateInvestmentPercentages(goalIndex)

			// Regenerate transactions after unlinking
			this.regenerateAllTransactions()
		}
	}

	recalculateInvestmentPercentages(goalIndex: number) {
		const goal = this.goals[goalIndex]
		if (!goal || goal.linkedInvestments.length === 0) return

		// Distribute percentages evenly
		const percentage = 100 / goal.linkedInvestments.length
		goal.linkedInvestments.forEach((li) => {
			li.percentage = percentage
		})
	}

	updateInvestment(investment: Investment) {
		const index = this.investments.findIndex((i) => i.id === investment.id)
		if (index !== -1) {
			this.investments[index] = {
				...investment,
				last_edited_at: new Date().toISOString(),
			}
		}
	}

	deleteInvestment(id: number) {
		const index = this.investments.findIndex((i) => i.id === id)
		if (index !== -1) {
			this.investments.splice(index, 1)

			// Unlink from all goals (this will trigger regenerateAllTransactions)
			this.goals.forEach((_, goalIndex) => {
				this.unlinkInvestmentFromGoal(goalIndex, id)
			})
		}
	}

	private generateDerivedTransactions(goalIndex: number, investmentId: number): Transaction[] {
		const goal = this.goals[goalIndex]
		if (!goal) return []

		const linkedInvestment = goal.linkedInvestments.find((li) => li.investmentId === investmentId)
		if (!linkedInvestment) return []

		// Get base transactions from the goal
		const baseTransactions = goalToTransactions(goal)

		// Scale transaction amounts by percentage and assign to investment
		const percentage = linkedInvestment.percentage / 100

		return baseTransactions.map((transaction) => ({
			...transaction,
			investment_id: investmentId,
			amount: transaction.amount * percentage,
			// ID will be assigned in regenerateAllTransactions
		}))
	}

	getGoalName(goal: Goal): string {
		if (goal.type === 'retirement') return get(_)('demo.investments.retirement')
		if (goal.type === 'education') return get(_)('demo.investments.education')
		return 'Goal'
	}

	regenerateAllTransactions() {
		// Clear all transactions and goal map
		this.transactions = []
		this.transactionGoalMap = new Map()

		let nextTransactionId = -1

		// Generate transactions for each goal's linked investments
		this.goals.forEach((goal, goalIndex) => {
			const goalName = this.getGoalName(goal)

			goal.linkedInvestments.forEach((linkedInvestment) => {
				const derivedTransactions = this.generateDerivedTransactions(
					goalIndex,
					linkedInvestment.investmentId,
				)

				// Assign unique IDs to each transaction and track goal association
				derivedTransactions.forEach((transaction) => {
					this.transactions.push({
						...transaction,
						id: nextTransactionId,
					})
					this.transactionGoalMap.set(nextTransactionId, goalName)
					nextTransactionId--
				})
			})
		})
	}

	/**
	 * Translates labels in graph data to use localized goal names
	 */
	private translateGraphDataLabels(data: PortfolioSimulation): PortfolioSimulation {
		const goalName = get(_)('demo.investments.retirement')

		return {
			...data,
			data: data.data.map((item) => ({
				...item,
				label: goalName,
			})),
			total: {
				...data.total,
				label: goalName,
			},
		}
	}

	/**
	 * Gets raw state data for a specific demo state
	 */
	private getRawStateData(state: DemoState): DemoStateData | undefined {
		switch (state) {
			case 1:
				return getState1Data()
			case 2:
				return getState2Data()
			case 3:
				return getState3Data()
			case 4:
				return getState4Data()
			case 5:
				return getState5Data()
			default:
				return undefined
		}
	}

	/**
	 * Sets the demo state and populates the corresponding data from TypeScript state functions
	 */
	setState(state: DemoState) {
		// Get state data from TypeScript functions
		const data = this.getRawStateData(state)
		if (!data) {
			console.error(`No state data found for state ${state}`)
			return
		}

		// Set the state
		this.demoState = state

		// Apply all state data directly - no calculations needed
		this.goals = data.goals
		this.investments = data.investments
		this.transactions = data.transactions
		this.transactionGoalMap = data.transactionGoalMap
		this.graphData = data.graphData
		this.goalsGraphData = data.goalsGraphData
		this.goalInvestments = data.goalInvestments
		this.goalTransactions = data.goalTransactions
	}

	initializeDemoPortfolio(clientId: number, currency = 'CZK') {
		const today = new Date()

		// Load state 1 (goal only) - this sets goals, investments, transactions, graphData, etc.
		this.setState(1)

		// Create demo portfolio based on first goal
		const goal = this.goals[0] as RetirementGoal
		const { depositStart, retirementStart, retirementLength, inflation } = goal.calculationInput
		const startDate = formatDate(depositStart)
		const endDate = formatDate(
			new Date(
				retirementStart.getFullYear() + retirementLength,
				retirementStart.getMonth(),
				retirementStart.getDate(),
			),
		)

		this.portfolio = {
			id: -1,
			client: clientId,
			name: get(_)('demo.portfolio.demoPortfolio'),
			currency,
			start_date: startDate,
			end_date: endDate,
			inflation_rate: inflation / 100,
			created_at: today.toISOString(),
			last_edited_at: today.toISOString(),
			link: null,
		}
	}

	/**
	 * Gets the appropriate investments to display based on selected tab
	 */
	getGraphInvestments(selectedTab: 'goals' | 'investments'): InvestmentWithColorIndex[] {
		return selectedTab === 'goals' ? this.goalInvestments : this.investments
	}

	/**
	 * Gets the appropriate transactions to display based on selected tab
	 */
	getGraphTransactions(selectedTab: 'goals' | 'investments'): Transaction[] {
		return selectedTab === 'goals' ? this.goalTransactions : this.transactions
	}

	/**
	 * Gets the appropriate graph data to display based on selected tab
	 */
	getGraphData(selectedTab: 'goals' | 'investments'): PortfolioSimulation {
		const hardcodedData = this.graphData

		// Empty simulation data structure with translated label
		const emptySimulationData: PortfolioSimulation = {
			data: [],
			total: {
				label: get(_)('demo.investments.retirement'),
				graphLabels: [],
				graphDeposits: [],
				graphWithdrawals: [],
				graphInvestmentValues: [],
				graphFeeValues: [],
				graphInflationDeposits: [],
				graphInflationWithdrawals: [],
				graphInflationInvestmentValues: [],
				graphInflationFeeValues: [],
			},
			isCalculating: false,
			progress: 100,
		}

		if (!hardcodedData) return emptySimulationData

		if (selectedTab === 'goals') {
			// If we have dedicated goals graph data (e.g., for multiple goals), use it
			if (this.goalsGraphData) {
				return this.goalsGraphData
			}

			// Translate labels for goals tab
			const translatedData = this.translateGraphDataLabels(hardcodedData)

			if (this.investments.length > 0) {
				// Show total from hardcoded investments simulation
				return {
					data: [translatedData.total],
					total: translatedData.total,
					isCalculating: false,
					progress: 100,
				}
			} else {
				// No investments, show hardcoded goal-only simulation
				return translatedData
			}
		} else {
			// Investments tab - use hardcoded data without translation
			return hardcodedData
		}
	}
}

export const demoStore = new DemoStore()
