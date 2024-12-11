import type { Portfolio, Store } from '$lib/types'

export interface PortfolioStore extends Store<Portfolio> {
	data: Portfolio[]
	loading: boolean
	reset: () => void
	filter: (clientId: number) => Portfolio[]
}

export function withPortfolioStore(): PortfolioStore {
	let data = $state<Portfolio[]>([])
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
		set loading(value: boolean) {
			loading = value
		},
		reset() {
			data = []
			loading = true
		},
		filter(clientId: number) {
			return data.filter((portfolio) => portfolio.client === clientId)
		},
	}
}

export const portfolioStore = withPortfolioStore()
