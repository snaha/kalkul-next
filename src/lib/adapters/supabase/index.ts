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

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: true,
	},
})

interface SupabaseSubscription {
	unsubscribe: () => void
}

async function loadStore<T extends { id: string | number }>(
	store: Store<T>,
	table: string,
	name: string,
	ids: (string | number)[],
) {
	store.reset()

	const res = await supabase.from(table).select('*').in(name, ids)

	if (res.error) {
		console.error('Error fetching data:', res.error)
	} else {
		store.data = res.data as (Omit<T, MetaFields> & { id: number })[]
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

						await loadStore<Client>(clientStore, 'client', 'advisor', [data.user.id])

						await loadStore<Portfolio>(
							portfolioStore,
							'portfolio',
							'client',
							clientStore.data.map((client) => client.id),
						)

						await loadStore<Investment>(
							investmentStore,
							'investment',
							'portfolio_id',
							portfolioStore.data.map((portfolio) => portfolio.id),
						)

						await loadStore<Transaction>(
							transactionStore,
							'transaction',
							'investment_id',
							investmentStore.data.map((investment) => investment.id),
						)
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

	async signUp(email: string, password: string, language: string, newsletterConsent: boolean) {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { prefer_language: language, newsletter_consent: newsletterConsent } },
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
		return this.addData('client', client, clientStore)
	}

	async updateClient(client: Partial<Client> & Pick<Client, 'id'>) {
		return this.updateData('client', client, clientStore)
	}

	async deleteClient(client: Partial<Client> & Pick<Client, 'id'>) {
		return this.deleteData('client', client, clientStore)
	}

	private async addData<T>(tableName: string, value: Omit<T, MetaFields>, store: Store<T>) {
		const { data, error } = await supabase.from(tableName).insert(value).select('id').single()
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

	async addInvestment(investment: Omit<Investment, MetaFields>) {
		return this.addData('investment', investment, investmentStore)
	}

	async updateInvestment(investment: Partial<Investment> & Pick<Investment, 'id'>) {
		return this.updateData('investment', investment, investmentStore)
	}

	async deleteInvestment(investment: Partial<Investment> & Pick<Investment, 'id'>) {
		return this.deleteData('investment', investment, investmentStore)
	}

	async addTransaction(transaction: Omit<Transaction, MetaFields>) {
		return this.addData('transaction', transaction, transactionStore)
	}

	private async updateData<T extends { id: number }>(
		tableName: string,
		value: Partial<T> & Pick<T, 'id'>,
		store: Store<T>,
	) {
		const origData = store.data
		store.data = store.data.map((item) => (item.id === value.id ? { ...item, ...value } : item))

		const { error } = await supabase.from(tableName).update(value).eq('id', value.id)

		if (error) {
			console.error(`Failed to update ${tableName}`, error)
			store.data = origData
			throw new Error(error.message)
		}
	}

	async updateTransaction(transaction: Partial<Transaction> & Pick<Transaction, 'id'>) {
		this.updateData('transaction', transaction, transactionStore)
	}

	private async deleteData<T extends { id: number }>(tableName: string, value: T, store: Store<T>) {
		const origData = store.data
		store.data = store.data.filter((item) => item.id !== value.id)

		const { error } = await supabase.from(tableName).delete().eq('id', value.id)

		if (error) {
			console.error(`Failed to delete from ${tableName}`, error)
			store.data = origData
			throw new Error(error.message)
		}
	}

	async deleteTransaction(transaction: Partial<Transaction> & Pick<Transaction, 'id'>) {
		return this.deleteData('transaction', transaction, transactionStore)
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
