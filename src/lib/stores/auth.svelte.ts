import type { User } from '@supabase/supabase-js'
interface AuthStore {
	isLoggedIn: boolean
	user: User | null
	loading: boolean
	passwordRecovery: boolean
}

export function withAuthStore(): AuthStore {
	let user = $state<User | null>(null)
	let loading = $state(false)
	let passwordRecovery = $state(false)
	const isLoggedIn = $derived(user !== null)

	return {
		get isLoggedIn() {
			return isLoggedIn
		},
		get loading() {
			return loading
		},
		get user() {
			return user
		},
		set user(value: User | null) {
			user = value
			loading = false
		},
		get passwordRecovery() {
			return passwordRecovery
		},
		set passwordRecovery(value: boolean) {
			passwordRecovery = value
		},
	}
}
