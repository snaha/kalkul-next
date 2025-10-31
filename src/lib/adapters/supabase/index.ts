import { createClient, type Session, type UserAttributes } from '@supabase/supabase-js'
import { page } from '$app/state'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Adapter } from '..'
import { authStore } from '$lib/stores/auth.svelte'
import type {
	ApiToken,
	Client,
	ClientNoId,
	Investment,
	MetaFields,
	Portfolio,
	StripeSubscription,
	Store,
	Transaction,
	TypedUserMetadata,
} from '$lib/types'
import type Stripe from 'stripe'
import { clientStore } from '$lib/stores/clients.svelte'
import { portfolioStore } from '$lib/stores/portfolio.svelte'
import { investmentStore } from '$lib/stores/investment.svelte'
import { transactionStore } from '$lib/stores/transaction.svelte'
import { apiRoutes } from '$lib/routes'
import { subscriptionStore } from '$lib/stores/subscription.svelte'
import { umami } from '$lib/umami-events'

const POSTGRES_NO_ROWS_ERROR_CODE = 'PGRST116'

interface SupabaseSubscription {
	unsubscribe: () => void
}

export default class Supabase implements Adapter {
	private subscriptions: SupabaseSubscription[] = []

	public constructor(
		private supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			auth: {
				autoRefreshToken: true,
			},
		}),
	) {}

	private async loadStore<T extends { id: string | number }>(
		store: Store<T>,
		table: string,
		name: string,
		ids: (string | number)[],
	) {
		store.reset()

		const res = await this.supabase.from(table).select('*').in(name, ids)

		if (res.error) {
			console.error('Error fetching data:', res.error)
		} else {
			store.data = res.data as (Omit<T, MetaFields> & { id: number })[]
		}
	}

	start() {
		if (authStore.user) return
		this.supabase.auth.startAutoRefresh()

		const onAuthStateChangeRes = this.supabase.auth.onAuthStateChange((event) => {
			setTimeout(async () => {
				if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
					const { data, error } = await this.supabase.auth.getUser()
					if (error) {
						console.error('Failed to fetch user', error)
						throw new Error('Failed to fetch user')
					}
					const {
						data: { session },
						error: sessionError,
					} = await this.supabase.auth.getSession()
					if (sessionError || !session) {
						console.error('Failed to fetch session', sessionError)
						throw new Error('Failed to fetch session')
					}
					// New user or different user is signed in
					if (authStore.user?.id !== data?.user?.id) {
						authStore.user = data.user
						authStore.session = session

						this.stop()

						await this.loadStore<Client>(clientStore, 'client', 'advisor', [data.user.id])

						await this.loadStore<Portfolio>(
							portfolioStore,
							'portfolio',
							'client',
							clientStore.data.map((client) => client.id),
						)

						await this.loadStore<Investment>(
							investmentStore,
							'investment',
							'portfolio_id',
							portfolioStore.data.map((portfolio) => portfolio.id),
						)

						await this.loadStore<Transaction>(
							transactionStore,
							'transaction',
							'investment_id',
							investmentStore.data.map((investment) => investment.id),
						)

						umami?.identity(authStore.user.id)
					}
				} else if (event === 'INITIAL_SESSION') {
					const { error } = await this.supabase.auth.refreshSession()
					if (error) {
						console.error('Failed to fetch session', error)
						authStore.user = undefined
						authStore.session = undefined
					}
				} else {
					console.log('User status changed', event)
				}
			}, 0)
		})

		this.subscriptions.push(onAuthStateChangeRes.data.subscription)
	}

	stop() {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe())
	}

	private async subscribeToNewsletter(email: string) {
		const res = await fetch(apiRoutes.NEWSLETTER_SUBSCRIBE, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		})
		if (!res.ok) {
			console.error('Failed to subscribe to newsletter', res.statusText, res)
		}
	}

	async signUp(
		email: string,
		password: string,
		language: string,
		newsletterConsent: boolean,
		promotionCode?: string,
	) {
		// Convert email address to lower-case
		email = email.toLowerCase()

		const data: TypedUserMetadata = {
			prefer_language: language,
			newsletter_consent: newsletterConsent,
			first_visit: true,
			...(promotionCode && { promotion_code: promotionCode }),
		}
		const { error } = await this.supabase.auth.signUp({
			email,
			password,
			options: { data },
		})
		if (error) {
			console.error('Failed to register', error)
			throw error
		}
		if (newsletterConsent) {
			await this.subscribeToNewsletter(email)
		}
		this.start()
	}

	async signIn(email: string, password: string) {
		// Convert email address to lower-case
		email = email.toLowerCase()

		const { error } = await this.supabase.auth.signInWithPassword({ email, password })
		if (error) {
			console.error('Failed to sign in', error)
			throw new Error(error.message)
		}
		authStore.loading = true
		this.start()
	}

	async signOut() {
		const { error } = await this.supabase.auth.signOut({ scope: 'local' })
		if (error) {
			console.error('Failed to sign out', error)
			throw new Error(error.message)
		}
		this.stop()
		authStore.user = undefined
		authStore.session = undefined
		subscriptionStore.reset()
	}

	async refreshSession() {
		const {
			data: { session },
			error,
		} = await this.supabase.auth.getSession()
		if (error || !session) {
			console.error('Failed to refresh session', error)
			throw new Error('Authentication required')
		}

		// Update auth store if we got a refreshed session
		if (authStore.session?.access_token !== session.access_token) {
			authStore.session = session
		}
	}

	async sendResetPasswordLink(email: string) {
		const redirectTo = `${page.url.origin}/reset-password`

		const { error } = await this.supabase.auth.resetPasswordForEmail(email, { redirectTo })

		if (error) {
			console.error('Failed to send reset password link', error)
			throw new Error(error.message)
		}
	}
	async resetPassword(newPassword: string) {
		const { error } = await this.supabase.auth.updateUser({ password: newPassword })
		if (error) {
			console.error('Failed to update password', error)
			throw new Error(error.message)
		}
	}

	async updateEmail(newEmail: string) {
		const { error } = await this.supabase.auth.updateUser({ email: newEmail })
		if (error) {
			console.error('Failed to update email', error)
			throw new Error(error.message)
		}
	}
	async updateLanguage(newLanguage: string) {
		const { error } = await this.supabase.auth.updateUser({
			data: { prefer_language: newLanguage },
		})
		if (error) {
			console.error('Failed to update language', error)
			throw new Error(error.message)
		}
	}

	async updateUserMetadata(data: Partial<TypedUserMetadata>) {
		const { error } = await this.supabase.auth.updateUser({
			data: { ...data },
		})
		if (error) {
			console.error('Failed to update user metadata', error)
			throw new Error(error.message)
		}
		if (authStore.user) {
			authStore.user = {
				...authStore.user,
				user_metadata: {
					...authStore.user.user_metadata,
					...data,
				},
			}
		}
	}

	async addClient(client: ClientNoId) {
		return this.addData('client', client, clientStore)
	}

	async updateClient(client: Partial<Client> & Pick<Client, 'id'>) {
		return this.updateData('client', client, clientStore)
	}

	async deleteClient(client: Partial<Client> & Pick<Client, 'id'>) {
		return this.deleteData('client', client, clientStore)
	}

	async getClients() {
		const res = await this.supabase.from('client').select('*')
		if (res.error) {
			throw new Error('Error fetching data:', res.error)
		} else {
			return res.data as Client[]
		}
	}

	private async addData<T>(tableName: string, value: Omit<T, MetaFields>, store: Store<T>) {
		const { data, error } = await this.supabase.from(tableName).insert(value).select('id').single()
		if (error) {
			console.error(`Failed to add ${tableName}`, error)
			throw new Error(error.message)
		}
		if (data.id === null) {
			console.error(`Failed to get id of added ${tableName}`, error)
			throw new Error(`Failed to get id of added ${tableName}`)
		}

		const newValue: Omit<T, MetaFields> & { id: number } = {
			...value,
			id: data.id as number,
		}
		store.data = [...store.data, newValue]

		return data.id
	}

	async addPortfolio(portfolio: Omit<Portfolio, MetaFields>) {
		return this.addData('portfolio', portfolio, portfolioStore)
	}

	async updatePortfolio(portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) {
		return this.updateData('portfolio', portfolio, portfolioStore)
	}

	async deletePortfolio(portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) {
		return this.deleteData('portfolio', portfolio, portfolioStore)
	}

	async getPortfolios(clientId: number) {
		const res = await this.supabase.from('portfolio').select('*').eq('client', clientId)
		if (res.error) {
			throw new Error(`Error fetching portfolios: ${res.error.message}`)
		} else {
			return res.data as Portfolio[]
		}
	}

	async addInvestment(investment: Omit<Investment, MetaFields>) {
		return this.addData('investment', investment, investmentStore)
	}

	async updateInvestment(investment: Partial<Investment> & Pick<Investment, 'id'>) {
		return this.updateData('investment', investment, investmentStore)
	}

	async deleteInvestment(investment: Partial<Investment> & Pick<Investment, 'id'>) {
		return this.deleteData('investment', investment, investmentStore)
	}

	async getInvestments(portfolioId: number) {
		const res = await this.supabase.from('investment').select('*').eq('portfolio_id', portfolioId)
		if (res.error) {
			throw new Error(`Error fetching investments: ${res.error.message}`)
		} else {
			return res.data as Investment[]
		}
	}

	async getInvestment(investmentId: number) {
		const res = await this.supabase.from('investment').select('*').eq('id', investmentId).single()
		if (res.error) {
			if (res.error.code === POSTGRES_NO_ROWS_ERROR_CODE) {
				return undefined // No rows found
			}
			throw new Error(`Error fetching investment: ${res.error.message}`)
		} else {
			return res.data as Investment
		}
	}

	private validateTransactionInvariants(transaction: Partial<Transaction>): void {
		const { repeat, repeat_unit, end_date } = transaction

		// Check if it's intended as a single transaction
		const isSingleTransaction = repeat === null || repeat === undefined
		// Check if it's intended as a recurring transaction
		const isRecurringTransaction = repeat !== null && repeat !== undefined

		if (isSingleTransaction) {
			// Single transaction: all recurring fields must be null
			if (repeat_unit !== null && repeat_unit !== undefined) {
				throw new Error('Single transaction must have repeat_unit as null')
			}
			if (end_date !== null && end_date !== undefined) {
				throw new Error('Single transaction must have end_date as null')
			}
		} else if (isRecurringTransaction) {
			// Recurring transaction: all recurring fields must be present
			if (!repeat_unit || typeof repeat_unit !== 'string') {
				throw new Error('Recurring transaction must have a valid repeat_unit string')
			}
			if (!end_date || typeof end_date !== 'string') {
				throw new Error('Recurring transaction must have a valid end_date string')
			}
			if (typeof repeat !== 'number' || repeat <= 0) {
				throw new Error('Recurring transaction must have a positive repeat number')
			}
		}
	}

	async addTransaction(transaction: Omit<Transaction, MetaFields>) {
		this.validateTransactionInvariants(transaction)
		return this.addData('transaction', transaction, transactionStore)
	}

	private async updateData<T extends { id: number }>(
		tableName: string,
		value: Partial<T> & Pick<T, 'id'>,
		store: Store<T>,
	) {
		const origData = store.data
		store.data = store.data.map((item) => (item.id === value.id ? { ...item, ...value } : item))

		const { error } = await this.supabase.from(tableName).update(value).eq('id', value.id)

		if (error) {
			console.error(`Failed to update ${tableName}`, error)
			store.data = origData
			throw new Error(error.message)
		}
	}

	async updateTransaction(transaction: Partial<Transaction> & Pick<Transaction, 'id'>) {
		this.validateTransactionInvariants(transaction)
		this.updateData('transaction', transaction, transactionStore)
	}

	private async deleteData<T extends { id: number }>(tableName: string, value: T, store: Store<T>) {
		const origData = store.data
		store.data = store.data.filter((item) => item.id !== value.id)

		const { error } = await this.supabase.from(tableName).delete().eq('id', value.id)

		if (error) {
			console.error(`Failed to delete from ${tableName}`, error)
			store.data = origData
			throw new Error(error.message)
		}
	}

	async deleteTransaction(transaction: Partial<Transaction> & Pick<Transaction, 'id'>) {
		return this.deleteData('transaction', transaction, transactionStore)
	}

	async getTransactions(investmentId: number) {
		const res = await this.supabase
			.from('transaction')
			.select('*')
			.eq('investment_id', investmentId)
		if (res.error) {
			throw new Error(`Error fetching transactions: ${res.error.message}`)
		} else {
			return res.data as Transaction[]
		}
	}

	async getTransaction(transactionId: number) {
		const res = await this.supabase.from('transaction').select('*').eq('id', transactionId).single()
		if (res.error) {
			if (res.error.code === POSTGRES_NO_ROWS_ERROR_CODE) {
				return undefined // No rows found
			}
			throw new Error(`Error fetching transaction: ${res.error.message}`)
		} else {
			return res.data as Transaction
		}
	}

	async getPortfolio(portfolioId: number) {
		const res = await this.supabase.from('portfolio').select('*').eq('id', portfolioId).single()
		if (res.error) {
			if (res.error.code === POSTGRES_NO_ROWS_ERROR_CODE) {
				return undefined // No rows found
			}
			throw new Error(`Error fetching portfolio: ${res.error.message}`)
		} else {
			return res.data as Portfolio
		}
	}

	async portfolioView(link_id: string) {
		const { data: portfolioData, error: portfolioError } = await this.supabase.rpc(
			'portfolio_readonly_view',
			{
				link_id,
			},
		)
		if (portfolioError) {
			console.error(portfolioError)
			return
		}

		const portfolios = portfolioData as Portfolio[]
		if (portfolios.length !== 1) {
			return
		}

		const portfolio = portfolios[0]

		const { data: clientData, error: clientError } = await this.supabase.rpc(
			'client_readonly_view',
			{
				link_id,
			},
		)
		if (clientError) {
			console.error(clientError)
			return
		}

		const clients = clientData as Client[]
		if (clients.length !== 1) {
			return
		}

		const client = clients[0]

		const { data: investmentData, error: investmentError } = await this.supabase.rpc(
			'investment_readonly_view',
			{
				link_id,
			},
		)
		if (investmentError) {
			console.error(investmentError)
			return
		}
		const investments = investmentData as Investment[]

		const { data: transactionData, error: transactionError } = await this.supabase.rpc(
			'transaction_readonly_view',
			{
				link_id,
			},
		)
		if (transactionError) {
			console.error(transactionError)
			return
		}

		const transactions = transactionData as Transaction[]

		return {
			portfolio,
			client,
			investments,
			transactions,
		}
	}

	async addISINError(identifier: string, error: object) {
		const { error: dbError } = await this.supabase.from('isin_errors').insert({ identifier, error })
		if (dbError) {
			console.error('Failed to add isin_error', dbError)
			throw new Error(dbError.message)
		}
	}

	async getMarketData(
		identifier: string,
		idType: string,
		updatedAfter: Date | undefined = undefined,
	): Promise<object | undefined> {
		const baseQuery = this.supabase
			.from('market_data_cache')
			.select('response_data')
			.eq('identifier', identifier)
			.eq('id_type', idType)
		const query = updatedAfter ? baseQuery.gt('updated_at', updatedAfter.toISOString()) : baseQuery
		const { data, error } = await query.single()

		if (error && error.code !== POSTGRES_NO_ROWS_ERROR_CODE) {
			console.error('Failed to get market data cache', error)
			throw new Error(error.message)
		}

		if (!data?.response_data) {
			return
		}

		return data.response_data
	}

	async addMarketData(identifier: string, idType: string, responseData: object) {
		const { error } = await this.supabase.from('market_data_cache').upsert(
			{
				identifier,
				id_type: idType,
				response_data: responseData,
			},
			{
				ignoreDuplicates: false,
				onConflict: 'identifier,id_type',
			},
		)

		if (error) {
			console.error('Failed to set market data cache', error)
			throw new Error(error.message)
		}
	}

	async upsertStripeSubscription(
		userId: string,
		subscription: Stripe.Subscription,
	): Promise<StripeSubscription> {
		const customerId = subscription.customer as string

		const subscriptionData: Omit<StripeSubscription, MetaFields> = {
			stripe_customer_id: customerId,
			user_id: userId,
			stripe_subscription_id: subscription.id,
			status: subscription.status,
			current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
			trial_end: subscription.trial_end
				? new Date(subscription.trial_end * 1000).toISOString()
				: null,
			items: subscription.items ? JSON.parse(JSON.stringify(subscription.items)) : null,
		}

		const { data, error } = await this.supabase
			.from('stripe_subscription')
			.upsert(subscriptionData, {
				onConflict: 'stripe_customer_id',
			})
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to upsert subscription: ${error.message}`, { cause: error })
		}

		return data
	}

	async getStripeSubscriptionByUserId(userId: string): Promise<StripeSubscription | undefined> {
		const { data, error } = await this.supabase
			.from('stripe_subscription')
			.select('*')
			.eq('user_id', userId)
			.single()

		if (error) {
			if (error.code === POSTGRES_NO_ROWS_ERROR_CODE) {
				// No rows returned
				return undefined
			}
			throw new Error(`Failed to get subscription: ${error.message}`, { cause: error })
		}

		return data
	}

	// Authentication and user management
	async generateAuthLink(email: string) {
		const { data, error } = await this.supabase.auth.admin.generateLink({
			type: 'magiclink',
			email: email,
		})
		return { data: data as { properties: { action_link: string } } | null, error }
	}

	async verifyOtp(token_hash: string, type: 'magiclink') {
		const { data, error } = await this.supabase.auth.verifyOtp({
			token_hash: token_hash,
			type: type,
		})
		return { data: { session: data.session }, error }
	}

	async setSession(session: Session) {
		const { error } = await this.supabase.auth.setSession({
			access_token: session.access_token,
			refresh_token: session.refresh_token,
		})
		if (error) {
			console.error('Failed to set session', error)
			throw new Error(error.message)
		}
	}

	async adminGetUserById(userId: string) {
		const { data, error } = await this.supabase.auth.admin.getUserById(userId)
		return { data, error }
	}

	async adminUpdateUserById(userId: string, updates: UserAttributes) {
		const { data, error } = await this.supabase.auth.admin.updateUserById(userId, updates)
		return { data, error }
	}

	async adminDeleteUser(userId: string) {
		const { error } = await this.supabase.auth.admin.deleteUser(userId)
		return { error }
	}

	async getApiTokens(userId: string): Promise<ApiToken[]> {
		const { data, error } = await this.supabase
			.from('api_tokens')
			.select('id, token_prefix, name, created_at, last_used_at, is_active, user_id')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })

		if (error) {
			console.error('Failed to fetch API tokens', error)
			throw new Error(error.message)
		}
		return data as ApiToken[]
	}

	async getApiToken(tokenHash: string): Promise<ApiToken | undefined> {
		const { data, error } = await this.supabase
			.from('api_tokens')
			.select('id, token_prefix, token_hash, name, created_at, last_used_at, is_active, user_id')
			.eq('token_hash', tokenHash)
			.order('created_at', { ascending: false })
			.single()

		if (error) {
			console.error('Failed to fetch API tokens', error)
			throw new Error(error.message)
		}
		return data
	}

	async createApiToken(
		userId: string,
		tokenHash: string,
		tokenPrefix: string,
		name: string,
	): Promise<ApiToken> {
		const { data, error } = await this.supabase
			.from('api_tokens')
			.insert({
				user_id: userId,
				token_hash: tokenHash,
				token_prefix: tokenPrefix,
				name: name.trim(),
			})
			.select('id, token_prefix, name, created_at, last_used_at, is_active, user_id')
			.single()

		if (error) {
			console.error('Failed to create API token', error)
			throw new Error(error.message)
		}
		return data as ApiToken
	}

	async deleteApiToken(tokenId: string, userId: string): Promise<void> {
		const { error } = await this.supabase
			.from('api_tokens')
			.delete()
			.eq('id', tokenId)
			.eq('user_id', userId)

		if (error) {
			console.error('Failed to delete API token', error)
			throw new Error(error.message)
		}
	}

	async updateApiToken(
		tokenId: string,
		userId: string,
		updates: { name?: string; is_active?: boolean; last_used_at?: string },
	): Promise<ApiToken> {
		const { data, error } = await this.supabase
			.from('api_tokens')
			.update(updates)
			.eq('id', tokenId)
			.eq('user_id', userId)
			.select('id, token_prefix, name, created_at, last_used_at, is_active, user_id')
			.single()

		if (error) {
			console.error('Failed to update API token', error)
			throw new Error(error.message)
		}
		return data as ApiToken
	}
}
