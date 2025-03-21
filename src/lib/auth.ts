import { authStore } from './stores/auth.svelte'

export async function authorizedFetch(input: string | URL | Request, init?: RequestInit) {
	return fetch(input, {
		headers: {
			Authorization: `${authStore.session?.token_type} ${authStore.session?.access_token}`,
			...init?.headers,
		},
		...init,
	})
}
