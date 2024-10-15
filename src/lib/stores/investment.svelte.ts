import type { Investment, Store } from '$lib/types'

export interface InvestmentStore extends Store<Investment> {
	data: Investment[]
	loading: boolean
	reset: () => void
	filter: (portfolioId: number) => Investment[]
}

export function withInvestmentStore(): InvestmentStore {
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
		reset() {
			data = []
			loading = true
		},
		filter(portfolioId: number) {
			return data.filter((investment) => investment.portfolio === portfolioId)
		},
	}
}

export const investmentStore = withInvestmentStore()
