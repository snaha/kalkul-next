import type { Session, User } from '@supabase/supabase-js'
interface AuthStore {
	isLoggedIn: boolean
	user?: User
	session?: Session
	loading: boolean
}

function withAuthStore(): AuthStore {
	let user = $state<User | undefined>()
	let session = $state<Session | undefined>()
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
		get session() {
			return session
		},
		set session(value: Session | undefined) {
			session = value
		},
	}
}

export const authStore = withAuthStore()
