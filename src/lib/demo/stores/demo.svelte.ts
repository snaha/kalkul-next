import { formatDate } from '$lib/@snaha/kalkul-maths'
import {
	calculateRequiredDeposit,
	type RetirementCalculationInput,
} from '$lib/demo/maths/retirement-calc'
import type { Portfolio, Investment, Transaction } from '$lib/types'

export const RETIREMENT_DEFAULTS = {
	RETIREMENT_AGE: 65,
	RETIREMENT_LENGTH: 20,
	CURRENCY: 'EUR',
	INFLATION: 2.5,
	DESIRED_BUDGET: 0,
	BUDGET_FREQUENCY: 'month' as const,
	CURRENT_SAVINGS: 0,
	APY: 5.5,
	DEPOSIT_FREQUENCY: 'month' as const,
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

export type Goal = RetirementGoal

export function goalToTransactions(goal: Goal): Transaction[] {
	// Convert goal to a series of transactions
	if (goal.type === 'retirement') {
		const transactions: Transaction[] = []
		const g = goal as RetirementGoal

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
				label: 'Initial Savings',
				repeat: null,
				repeat_unit: null,
			})
		}
		// Add regular deposits until retirement
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
			label: 'Regular Deposit',
			repeat: 1,
			repeat_unit: g.calculationInput.depositFrequency === 'month' ? 'month' : 'year',
		})

		// Add withdrawals during retirement
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
			label: 'Retirement Withdrawal',
			repeat: 1,
			repeat_unit: g.calculationInput.budgetFrequency === 'month' ? 'month' : 'year',
		})

		return transactions
	}
	return []
}

export function goalToInvestment(goal: Goal): Investment {
	// Convert goal to a demo investment
	return {
		id: -1, // Demo ID
		portfolio_id: -1, // Demo portfolio ID
		name: 'Retirement',
		apy: goal.type === 'retirement' ? goal.calculationInput.apy : 5.0,
		type: 'etf',
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
	}
}

class DemoStore {
	goals = $state<Goal[]>([])

	// Demo data for goals page - empty arrays, no DB fetching
	portfolio = $state<Portfolio | undefined>(undefined)
	investments = $state<Investment[]>([])
	transactions = $state<Transaction[]>([])
	transactionGoalMap = $state<Map<number, string>>(new Map())

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

	addInvestment(investment: Omit<Investment, 'id' | 'created_at' | 'last_edited_at'>) {
		const now = new Date().toISOString()
		const newId =
			this.investments.length > 0 ? Math.min(...this.investments.map((i) => i.id)) - 1 : -1
		this.investments.push({
			...investment,
			id: newId,
			created_at: now,
			last_edited_at: now,
		})

		// Link the new investment to the first goal (demo mode only has one goal)
		// This will trigger regenerateAllTransactions()
		if (this.goals.length > 0) {
			this.linkInvestmentToGoal(0, newId)
		}
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
		return goal.type === 'retirement' ? 'Retirement' : 'Goal'
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

	initializeDemoPortfolio(clientId: number, currency = 'EUR') {
		const today = new Date()

		// Add default retirement goal if no goals exist
		if (this.goals.length === 0) {
			const depositStart = new Date()
			const retirementStart = new Date(today.getFullYear() + 42, today.getMonth(), today.getDate())

			this.goals = [
				{
					type: 'retirement',
					currency,
					linkedInvestments: [],
					customDepositAmount: 180.57,
					calculationInput: {
						apy: 5.5,
						budgetFrequency: 'month',
						currentSavings: 11258,
						depositFrequency: 'month',
						depositStart,
						desiredBudget: 3500,
						inflation: 2.5,
						retirementLength: 20,
						retirementStart,
					},
				},
			]
		}

		// Use goal data to initialize portfolio (goal always exists at this point)
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
			id: -1, // Demo ID
			client: clientId,
			name: 'Demo Portfolio',
			currency,
			start_date: startDate,
			end_date: endDate,
			inflation_rate: inflation / 100, // Convert percentage to decimal
			created_at: today.toISOString(),
			last_edited_at: today.toISOString(),
			link: null,
		}

		// Start with empty investments and transactions
		this.investments = []
		this.transactions = []
	}
}

export const demoStore = new DemoStore()
