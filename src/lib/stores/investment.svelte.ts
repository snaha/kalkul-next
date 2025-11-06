import type { Investment, Store, Goal } from '$lib/types'

interface InvestmentStore extends Store<Investment> {
	data: Investment[]
	loading: boolean
	reset: () => void
	filter: (portfolioId: number) => Investment[]
	filterGoals: (portfolioId: number) => Goal[]
	filterRegularInvestments: (portfolioId: number) => Investment[]
}

function withInvestmentStore(): InvestmentStore {
	let data = $state<Investment[]>([])
	let loading = $state(true)

	return {
		get data() {
			return data
		},
		set data(newValue) {
			data = newValue
			loading = false
		},
		get loading() {
			return loading
		},
		set loading(newValue) {
			loading = newValue
		},
		reset() {
			data = []
			loading = true
		},
		filter(portfolioId: number) {
			return data.filter((investment) => investment.portfolio_id === portfolioId)
		},
		filterGoals(portfolioId: number) {
			return data.filter(
				(investment) =>
					investment.portfolio_id === portfolioId &&
					investment.goal_data !== undefined &&
					investment.goal_data !== null,
			) as Goal[]
		},
		filterRegularInvestments(portfolioId: number) {
			return data.filter(
				(investment) =>
					investment.portfolio_id === portfolioId &&
					(investment.goal_data === undefined || investment.goal_data === null),
			)
		},
	}
}

export const investmentStore = withInvestmentStore()
