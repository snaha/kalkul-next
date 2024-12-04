import type { User } from '@supabase/supabase-js'
interface AuthStore {
	isLoggedIn: boolean
	user?: User
	loading: boolean
	passwordRecovery: boolean
	signingIn: boolean
}

export function withAuthStore(): AuthStore {
	let user = $state<User | undefined>()
	let loading = $state(true)
	let passwordRecovery = $state(false)
	let signingIn = $state(false)
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
		get passwordRecovery() {
			return passwordRecovery
		},
		set passwordRecovery(value: boolean) {
			passwordRecovery = value
		},
		get signingIn() {
			return signingIn
		},
		set signingIn(value: boolean) {
			signingIn = value
		},
	}
}

export const authStore = withAuthStore()
