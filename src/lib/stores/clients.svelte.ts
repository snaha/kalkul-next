import type { Investment, Portfolio } from '$lib/types'

export interface Client {
	name: string
	birthDate: Date
	imageURI: string | undefined
	portfolios: Portfolio[]
	investments: Investment[]
}

export interface ClientStore {
	readonly clients: Client[]

	addClient: (client: Client) => void
}

export function withClientStore(): ClientStore {
	const clients: Client[] = $state([])

	function addClient(client: Client) {
		clients.push(client)
	}

	return {
		get clients() {
			return clients
		},
		addClient,
	}
}

export const clientStore = withClientStore()
