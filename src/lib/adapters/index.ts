import type { ClientNoId } from '$lib/types'
import SupabaseAdapter from './supabase'

export interface Adapter {
	// This is run when the app is mounted and should start app wide subscriptions
	start: () => Promise<void> | void
	// This is run when the app unmounts and should clear subscriptions
	stop: () => Promise<void> | void

	signUp: (email: string, password: string) => Promise<void>
	signIn: (email: string, password: string) => Promise<void>
	signOut: () => Promise<void>

	addClient: (client: ClientNoId) => Promise<number>
}

export default new SupabaseAdapter()
