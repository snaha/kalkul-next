import type { ClientNoId, Investment, MetaFields, Portfolio, Transaction } from '$lib/types'
import SupabaseAdapter from './supabase'

export interface Adapter {
	// This is run when the app is mounted and should start app wide subscriptions
	start: () => Promise<void> | void
	// This is run when the app unmounts and should clear subscriptions
	stop: () => Promise<void> | void

	signUp: (email: string, password: string) => Promise<void>
	signIn: (email: string, password: string) => Promise<void>
	signOut: () => Promise<void>
	sendResetPasswordLink: (email: string) => Promise<void>
	updatePassword: (newPassword: string) => Promise<void>

	addClient: (client: ClientNoId) => Promise<number>
	addPortfolio: (portfolio: Omit<Portfolio, MetaFields>) => Promise<number>
	addInvestment: (investment: Omit<Investment, MetaFields>) => Promise<number>
	addTransaction: (transaction: Omit<Transaction, MetaFields>) => Promise<number>
	updateTransaction: (transaction: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>
	deleteTransaction: (transaction: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>
}

export default new SupabaseAdapter() as Adapter
