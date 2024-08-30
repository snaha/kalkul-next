import type { Client, Store } from '$lib/types'

export interface ClientStore extends Store<Client> {
	data: Client[]
	loading: boolean
	reset: () => void
}

export function withClientStore(): ClientStore {
	let data = $state<Client[]>([])
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
	}
}
