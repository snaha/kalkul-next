import { authStore } from './stores/auth.svelte'
import adapter from './adapters'

export async function authorizedFetch(input: string | URL | Request, init?: RequestInit) {
	// Refresh session through adapter (this triggers refresh if needed)
	await adapter.refreshSession()

	if (!authStore.session) {
		throw new Error('Authentication required')
	}

	console.debug('authorizedFetch', { authStore, init })

	return fetch(input, {
		...init,
		headers: {
			Authorization: `${authStore.session.token_type} ${authStore.session.access_token}`,
			...init?.headers,
		},
	})
}
