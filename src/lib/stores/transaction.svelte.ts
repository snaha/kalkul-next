import type { Transaction, Store } from '$lib/types'

export interface TransactionStore extends Store<Transaction> {
	data: Transaction[]
	loading: boolean
	reset: () => void
	filter: (investmentId: number) => Transaction[]
}

function withTransactionStore(): TransactionStore {
	let data = $state<Transaction[]>([])
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
		filter(investmentId: number) {
			return data.filter((transaction) => transaction.investment_id === investmentId)
		},
	}
}

export const transactionStore = withTransactionStore()
