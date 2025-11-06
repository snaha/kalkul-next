import type {
	ApiToken,
	Client,
	ClientNoId,
	Investment,
	MetaFields,
	Portfolio,
	PortfolioView,
	StripeSubscription,
	Transaction,
	TypedUserMetadata,
} from '$lib/types'
import type Stripe from 'stripe'
import SupabaseAdapter from './supabase'
import type { Session, User, UserAttributes } from '@supabase/supabase-js'

export interface Adapter {
	// This is run when the app is mounted and should start app wide subscriptions
	start: () => Promise<void> | void
	// This is run when the app unmounts and should clear subscriptions
	stop: () => Promise<void> | void

	signUp: (
		email: string,
		password: string,
		language: string,
		newsletterConsent: boolean,
		promotionCode?: string,
	) => Promise<void>
	signIn: (email: string, password: string) => Promise<void>
	signOut: () => Promise<void>
	refreshSession: () => Promise<void>
	sendResetPasswordLink: (email: string) => Promise<void>
	resetPassword: (newPassword: string) => Promise<void>
	updateEmail: (newEmail: string) => Promise<void>
	updateLanguage: (newLanguage: string) => Promise<void>
	updateUserMetadata: (data: Partial<TypedUserMetadata>) => Promise<void>

	addClient: (client: ClientNoId) => Promise<number>
	updateClient: (client: Partial<Client> & Pick<Client, 'id'>) => Promise<void>
	deleteClient: (client: Partial<Client> & Pick<Client, 'id'>) => Promise<void>
	getClients: () => Promise<Client[]>

	addPortfolio: (portfolio: Omit<Portfolio, MetaFields>) => Promise<number>
	updatePortfolio: (portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) => Promise<void>
	deletePortfolio: (portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) => Promise<void>
	getPortfolios: (clientId: number) => Promise<Portfolio[]>

	addInvestment: (investment: Omit<Investment, MetaFields>) => Promise<number>
	updateInvestment: (investment: Partial<Investment> & Pick<Investment, 'id'>) => Promise<void>
	deleteInvestment: (investment: Partial<Investment> & Pick<Investment, 'id'>) => Promise<void>
	getInvestments: (portfolioId: number) => Promise<Investment[]>
	getInvestment: (investmentId: number) => Promise<Investment | undefined>

	// Goal methods (goals are investments with goal_data)
	addGoal: (goal: Omit<Investment, MetaFields>) => Promise<number>
	updateGoal: (goal: Partial<Investment> & Pick<Investment, 'id'>) => Promise<void>

	addTransaction: (transaction: Omit<Transaction, MetaFields>) => Promise<number>
	updateTransaction: (transaction: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>
	deleteTransaction: (transaction: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>
	getTransactions: (investmentId: number) => Promise<Transaction[]>
	getTransaction: (transactionId: number) => Promise<Transaction | undefined>
	getPortfolio: (portfolioId: number) => Promise<Portfolio | undefined>

	portfolioView: (id: string) => Promise<PortfolioView | undefined>

	addISINError: (identifier: string, error: object) => Promise<void>

	getMarketData: (
		identifier: string,
		idType: string,
		updatedAfter: Date | undefined,
	) => Promise<object | undefined>
	addMarketData: (identifier: string, idType: string, responseData: object) => Promise<void>

	// Stripe subscription management
	upsertStripeSubscription: (
		userId: string,
		subscription: Stripe.Subscription,
	) => Promise<StripeSubscription>
	getStripeSubscriptionByUserId: (userId: string) => Promise<StripeSubscription | undefined>

	// Authentication and user management
	generateAuthLink: (
		email: string,
	) => Promise<{ data: { properties: { action_link: string } } | null; error: Error | null }>
	verifyOtp: (
		token_hash: string,
		type: 'magiclink',
	) => Promise<{ data: { session: Session | null }; error: Error | null }>
	setSession: (session: Session) => Promise<void>
	adminGetUserById: (
		userId: string,
	) => Promise<{ data: { user: User | null }; error: Error | null }>
	adminUpdateUserById: (
		userId: string,
		updates: UserAttributes,
	) => Promise<{ data: { user: User | null }; error: Error | null }>
	adminDeleteUser: (userId: string) => Promise<{ error: Error | null }>

	// New methods for API token management
	getApiTokens: (userId: string) => Promise<ApiToken[]>
	getApiToken: (tokenHash: string) => Promise<ApiToken | undefined>
	createApiToken: (
		userId: string,
		tokenHash: string,
		tokenPrefix: string,
		name: string,
	) => Promise<ApiToken>
	deleteApiToken: (tokenId: string, userId: string) => Promise<void>
	updateApiToken: (
		tokenId: string,
		userId: string,
		updates: { name?: string; is_active?: boolean; last_used_at?: string },
	) => Promise<ApiToken>
}

export default new SupabaseAdapter() as Adapter
