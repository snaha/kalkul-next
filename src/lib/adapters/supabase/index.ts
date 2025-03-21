import { createClient } from '@supabase/supabase-js'
import { page } from '$app/state'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Adapter } from '..'
import { authStore } from '$lib/stores/auth.svelte'
import {
	type Transaction,
	type Client,
	type ClientNoId,
	type Investment,
	type MetaFields,
	type Portfolio,
	type Store,
	type Feedback,
} from '$lib/types'
import { clientStore } from '$lib/stores/clients.svelte'
import { portfolioStore } from '$lib/stores/portfolio.svelte'
import { investmentStore } from '$lib/stores/investment.svelte'
import { transactionStore } from '$lib/stores/transaction.svelte'

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

interface SupabaseSubscription {
	unsubscribe: () => void
}

interface StoreSubscription extends SupabaseSubscription {
	queryPromise: PromiseLike<void>
}

function subscribe<T extends { id: string | number }>(
	store: Store<T>,
	table: string,
	name: string,
	ids: (string | number)[],
): StoreSubscription {
	store.reset()

	const query = supabase.from(table).select('*').in(name, ids)

	const queryPromise = query.then((res) => {
		if (res.error) {
			console.error('Error fetching data:', res.error)
		} else {
			store.data = res.data as T[]
		}
	})

	const channel = supabase.channel(`public:${table}`)

	channel
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table,
			},
			(payload) => {
				switch (payload.eventType) {
					case 'INSERT':
						store.data = [...store.data, payload.new as T]
						break
					case 'UPDATE':
						store.data = store.data.map((item) =>
							item.id === payload.new.id ? { ...item, ...payload.new } : item,
						)
						break
					case 'DELETE':
						store.data = store.data.filter((item) => item.id !== payload.old.id)
						break
				}
			},
		)
		.subscribe((status, error) => {
			console.log('Status:', status)
			if (error) {
				console.error('Subscription error:', error)
			}
		})

	return {
		unsubscribe: () => {
			supabase.removeChannel(channel)
			store.reset()
		},
		queryPromise,
	}
}

export default class Supabase implements Adapter {
	private subscriptions: SupabaseSubscription[] = []

	start() {
		if (authStore.user) return
		supabase.auth.startAutoRefresh()

		const onAuthStateChangeRes = supabase.auth.onAuthStateChange((event) => {
			setTimeout(async () => {
				if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
					const { data, error } = await supabase.auth.getUser()
					if (error) {
						console.error('Failed to fetch user', error)
						throw new Error('Failed to fetch user')
					}
					const {
						data: { session },
						error: sessionError,
					} = await supabase.auth.getSession()
					if (sessionError || !session) {
						console.error('Failed to fetch session', sessionError)
						throw new Error('Failed to fetch session')
					}
					// New user or different user is signed in
					if (authStore.user?.id !== data?.user?.id) {
						authStore.user = data.user
						authStore.session = session

						this.stop()

						const clientsSubscription = subscribe<Client>(clientStore, 'client', 'advisor', [
							data.user.id,
						])
						this.subscriptions.push(clientsSubscription)

						await clientsSubscription.queryPromise

						const portfoliosSubscription = subscribe<Portfolio>(
							portfolioStore,
							'portfolio',
							'client',
							clientStore.data.map((client) => client.id),
						)
						this.subscriptions.push(portfoliosSubscription)

						await portfoliosSubscription.queryPromise

						const investmentSubscription = subscribe<Investment>(
							investmentStore,
							'investment',
							'portfolio_id',
							portfolioStore.data.map((portfolio) => portfolio.id),
						)
						this.subscriptions.push(investmentSubscription)

						await investmentSubscription.queryPromise

						const transactionSubscription = subscribe<Transaction>(
							transactionStore,
							'transaction',
							'investment_id',
							investmentStore.data.map((investment) => investment.id),
						)
						this.subscriptions.push(transactionSubscription)

						await transactionSubscription.queryPromise
					}
				} else if (event === 'INITIAL_SESSION') {
					const { error } = await supabase.auth.refreshSession()
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

	async signUp(email: string, password: string, language: string) {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { prefer_language: language } },
		})
		if (error) {
			console.error('Failed to register', error)
			throw new Error(error.message)
		}
		this.start()
	}

	async signIn(email: string, password: string) {
		const { error } = await supabase.auth.signInWithPassword({ email, password })
		if (error) {
			console.error('Failed to sign in', error)
			throw new Error(error.message)
		}
		authStore.loading = true
		this.start()
	}

	async signOut() {
		const { error } = await supabase.auth.signOut({ scope: 'local' })
		if (error) {
			console.error('Failed to sign out', error)
			throw new Error(error.message)
		}
		this.stop()
		authStore.user = undefined
		authStore.session = undefined
	}

	async sendResetPasswordLink(email: string) {
		const redirectTo = `${page.url.origin}/reset-password`

		const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

		if (error) {
			console.error('Failed to send reset password link', error)
			throw new Error(error.message)
		}
	}
	async resetPassword(newPassword: string) {
		const { error } = await supabase.auth.updateUser({ password: newPassword })
		if (error) {
			console.error('Failed to update password', error)
			throw new Error(error.message)
		}
	}

	async updateEmail(newEmail: string) {
		const { error } = await supabase.auth.updateUser({ email: newEmail })
		if (error) {
			console.error('Failed to update email', error)
			throw new Error(error.message)
		}
	}
	async updateLanguage(newLanguage: string) {
		const { error } = await supabase.auth.updateUser({
			data: { prefer_language: newLanguage },
		})
		if (error) {
			console.error('Failed to update language', error)
			throw new Error(error.message)
		}
	}

	async addClient(client: ClientNoId) {
		const { data, error } = await supabase.from('client').insert(client).select('id').single()
		if (error) {
			console.error('Failed to add client', error)
			throw new Error(error.message)
		}
		if (data.id === null) {
			console.error('Failed to get id of added client', error)
			throw new Error('Failed to get id of added client')
		}
		return data.id
	}

	async updateClient(client: Partial<Client> & Pick<Client, 'id'>) {
		return this.updateData('client', client)
	}

	async deleteClient(client: Partial<Client> & Pick<Client, 'id'>) {
		return this.deleteData('client', client)
	}

	private async addData<T>(tableName: string, value: Omit<T, MetaFields>) {
		const { data, error } = await supabase.from(tableName).insert(value).select('id').single()
		if (error) {
			console.error(`Failed to add ${tableName}`, error)
			throw new Error(error.message)
		}
		if (data.id === null) {
			console.error(`Failed to get id of added ${tableName}`, error)
			throw new Error(`Failed to get id of added ${tableName}`)
		}
		return data.id
	}

	async addPortfolio(portfolio: Omit<Portfolio, MetaFields>) {
		return this.addData('portfolio', portfolio)
	}

	async updatePortfolio(portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) {
		return this.updateData('portfolio', portfolio)
	}

	async deletePortfolio(portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) {
		return this.deleteData('portfolio', portfolio)
	}

	async addInvestment(investment: Omit<Investment, MetaFields>) {
		return this.addData('investment', investment)
	}

	async updateInvestment(investment: Partial<Transaction> & Pick<Transaction, 'id'>) {
		return this.updateData('investment', investment)
	}

	async deleteInvestment(investment: Partial<Transaction> & Pick<Transaction, 'id'>) {
		return this.deleteData('investment', investment)
	}

	async addTransaction(transaction: Omit<Transaction, MetaFields>) {
		return this.addData('transaction', transaction)
	}

	private async updateData<T extends { id: number }>(
		tableName: string,
		value: Partial<T> & Pick<T, 'id'>,
	) {
		const { error } = await supabase.from(tableName).update(value).eq('id', value.id)

		if (error) {
			console.error(`Failed to update ${tableName}`, error)
			throw new Error(error.message)
		}
	}

	async updateTransaction(transaction: Partial<Transaction> & Pick<Transaction, 'id'>) {
		this.updateData('transaction', transaction)
	}

	private async deleteData<T extends { id: number }>(tableName: string, value: T) {
		const { error } = await supabase.from(tableName).delete().eq('id', value.id)

		if (error) {
			console.error(`Failed to delete from ${tableName}`, error)
			throw new Error(error.message)
		}
	}

	async deleteTransaction(transaction: Partial<Transaction> & Pick<Transaction, 'id'>) {
		return this.deleteData('transaction', transaction)
	}

	async portfolioView(link_id: string) {
		const { data: portfolioData, error: portfolioError } = await supabase.rpc(
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

		const { data: clientData, error: clientError } = await supabase.rpc('client_readonly_view', {
			link_id,
		})
		if (clientError) {
			console.error(clientError)
			return
		}

		const clients = clientData as Client[]
		if (clients.length !== 1) {
			return
		}

		const client = clients[0]

		const { data: investmentData, error: investmentError } = await supabase.rpc(
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

		const { data: transactionData, error: transactionError } = await supabase.rpc(
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

	async addFeedback(feedback: Omit<Feedback, MetaFields>) {
		const { error } = await supabase.from('feedback').insert(feedback)
		if (error) {
			console.error('Failed to add feedback', error)
			throw new Error(error.message)
		}
	}
}
