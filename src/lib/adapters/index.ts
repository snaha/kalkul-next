import type { ClientNoId, Investment, Portfolio } from '$lib/types'
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
	addPortfolio: (
		portfolio: Omit<Portfolio, 'id' | 'created_at' | 'last_edited_at'>,
	) => Promise<number>
	addInvestment: (
		investment: Omit<Investment, 'id' | 'created_at' | 'last_edited_at'>,
	) => Promise<number>
}

export default new SupabaseAdapter()
