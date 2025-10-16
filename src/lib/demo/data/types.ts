import type { Goal } from '$lib/demo/stores/demo.svelte'
import type { InvestmentWithColorIndex, Transaction } from '$lib/types'
import type { PortfolioSimulation } from '$lib/stores/portfolio-simulation.svelte'

/**
 * Complete state data structure for demo states
 */
export type DemoStateData = {
	goals: Goal[]
	investments: InvestmentWithColorIndex[]
	transactions: Transaction[]
	transactionGoalMap: Map<number, string>
	graphData: PortfolioSimulation
	goalsGraphData?: PortfolioSimulation
	goalInvestments: InvestmentWithColorIndex[]
	goalTransactions: Transaction[]
}
