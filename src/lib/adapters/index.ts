import type {
	Client,
	ClientNoId,
	Investment,
	MetaFields,
	Portfolio,
	PortfolioView,
	Transaction,
} from '$lib/types'
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
	updateEmail: (newEmail: string) => Promise<void>

	addClient: (client: ClientNoId) => Promise<number>
	updateClient: (client: Partial<Client> & Pick<Client, 'id'>) => Promise<void>
	deleteClient: (client: Partial<Client> & Pick<Client, 'id'>) => Promise<void>

	addPortfolio: (portfolio: Omit<Portfolio, MetaFields>) => Promise<number>
	updatePortfolio: (portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) => Promise<void>
	deletePortfolio: (portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) => Promise<void>

	addInvestment: (investment: Omit<Investment, MetaFields>) => Promise<number>
	deleteInvestment: (investment: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>

	addTransaction: (transaction: Omit<Transaction, MetaFields>) => Promise<number>
	updateTransaction: (transaction: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>
	deleteTransaction: (transaction: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>

	portfolioView: (id: string) => Promise<PortfolioView | undefined>
}

export default new SupabaseAdapter() as Adapter
