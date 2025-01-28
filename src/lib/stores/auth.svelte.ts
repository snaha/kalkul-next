import type { User } from '@supabase/supabase-js'
interface AuthStore {
	isLoggedIn: boolean
	user?: User
	loading: boolean
}

export function withAuthStore(): AuthStore {
	let user = $state<User | undefined>()
	let loading = $state(true)
	const isLoggedIn = $derived(user !== undefined)

	return {
		get isLoggedIn() {
			return isLoggedIn
		},
		get loading() {
			return loading
		},
		set loading(value: boolean) {
			loading = value
		},
		get user() {
			return user
		},
		set user(value: User | undefined) {
			user = value
			loading = false
		},
	}
}

export const authStore = withAuthStore()
