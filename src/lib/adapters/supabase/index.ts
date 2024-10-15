import { createClient, type Subscription as SupabaseSubscription } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Adapter } from '..'
import { withAuthStore } from '$lib/stores/auth.svelte'
import type { Client, ClientNoId, Investment, MetaFields, Portfolio } from '$lib/types'
import { withClientStore, type ClientStore } from '$lib/stores/clients.svelte'
import { portfolioStore, type PortfolioStore } from '$lib/stores/portfolio.svelte'
import { investmentStore, type InvestmentStore } from '$lib/stores/investment.svelte'

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

const clientTable = 'client'
const portfolioTable = 'portfolio'
const investmentTable = 'investment'

interface Subscription {
	unsubscribe: () => void
	promise: PromiseLike<void>
}

function subscribeClients(store: ClientStore, uuid: string): Subscription {
	store.reset()

	let query = supabase.from(clientTable).select('*')

	query = query.eq('advisor', uuid)

	const promise = query.then((res) => {
		if (res.error) {
			console.error('Error fetching data:', res.error)
		} else {
			store.data = res.data as Client[]
		}
	})

	const channel = supabase.channel(`public:${clientTable}`)

	channel
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: clientTable,
			},
			(payload) => {
				switch (payload.eventType) {
					case 'INSERT':
						store.data.push(payload.new as Client)
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
		promise,
	}
}

function subscribePortfolios(store: PortfolioStore, clientIds: number[]): Subscription {
	store.reset()

	const query = supabase.from(portfolioTable).select('*').in('client', clientIds)

	const promise = query.then((res) => {
		if (res.error) {
			console.error('Error fetching data:', res.error)
		} else {
			store.data = res.data as Portfolio[]
		}
	})

	const channel = supabase.channel(`public:${portfolioTable}`)

	channel
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: portfolioTable,
			},
			(payload) => {
				switch (payload.eventType) {
					case 'INSERT':
						store.data.push(payload.new as Portfolio)
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
		promise,
	}
}

function subscribeInvestments(store: InvestmentStore, portfolioIds: number[]): Subscription {
	store.reset()

	const query = supabase.from(investmentTable).select('*').in('portfolio', portfolioIds)

	const promise = query.then((res) => {
		if (res.error) {
			console.error('Error fetching data:', res.error)
		} else {
			store.data = res.data as Investment[]
		}
	})

	const channel = supabase.channel(`public:${investmentTable}`)

	channel
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: investmentTable,
			},
			(payload) => {
				switch (payload.eventType) {
					case 'INSERT':
						store.data.push(payload.new as Investment)
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
		promise,
	}
}

export default class Supabase implements Adapter {
	public authStore = withAuthStore()
	private clientsStore = withClientStore()
	private clientsSubscription: Subscription | undefined = undefined
	private portfoliosSubscription: Subscription | undefined = undefined
	private investmentSubscription: Subscription | undefined = undefined
	private authSubscription: SupabaseSubscription | undefined

	start() {
		if (this.authSubscription) return

		supabase.auth.startAutoRefresh()

		const onAuthStateChangeRes = supabase.auth.onAuthStateChange((event) => {
			setTimeout(async () => {
				if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
					const { data, error } = await supabase.auth.getUser()
					if (error) {
						console.error('Failed to fetch user', error)
						throw new Error('Failed to fetch user')
					}
					// New user or different user is signed in
					if (this.authStore.user?.id !== data?.user?.id) {
						this.authStore.user = data.user
						if (this.clientsSubscription) this.clientsSubscription.unsubscribe()
						this.clientsSubscription = subscribeClients(this.clients, data.user.id)

						await this.clientsSubscription.promise
						this.portfoliosSubscription = subscribePortfolios(
							portfolioStore,
							this.clientsStore.data.map((client) => client.id),
						)

						await this.portfoliosSubscription.promise
						this.investmentSubscription = subscribeInvestments(
							investmentStore,
							portfolioStore.data.map((portfolio) => portfolio.id),
						)
					}
				} else if (event === 'SIGNED_OUT') {
					this.authStore.user = null
					this.stop()
				} else {
					console.log('User status changed', event)
				}
			}, 0)
		})

		this.authSubscription = onAuthStateChangeRes.data.subscription
	}

	stop() {
		this.authSubscription?.unsubscribe()
		this.authSubscription = undefined

		this.clientsSubscription?.unsubscribe()
		this.clientsSubscription = undefined

		this.portfoliosSubscription?.unsubscribe()
		this.portfoliosSubscription = undefined

		this.investmentSubscription?.unsubscribe()
		this.investmentSubscription = undefined
	}

	async signUp(email: string, password: string) {
		const { error } = await supabase.auth.signUp({ email, password })
		if (error) {
			console.error('Failed to register', error)
			throw new Error(error.message)
		}
	}

	async signIn(email: string, password: string) {
		const { error } = await supabase.auth.signInWithPassword({ email, password })
		if (error) {
			console.error('Failed to sign in', error)
			throw new Error(error.message)
		}
	}
	async signOut() {
		const { error } = await supabase.auth.signOut()
		if (error) {
			console.error('Failed to sign out', error)
			throw new Error(error.message)
		}
	}

	async addClient(client: ClientNoId) {
		const { data, error } = await supabase.from(clientTable).insert(client).select('id').single()
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

	async addPortfolio(portfolio: Omit<Portfolio, MetaFields>) {
		const { data, error } = await supabase
			.from(portfolioTable)
			.insert(portfolio)
			.select('id')
			.single()
		if (error) {
			console.error('Failed to add portfolio', error)
			throw new Error(error.message)
		}
		if (data.id === null) {
			console.error('Failed to get id of added portfolio', error)
			throw new Error('Failed to get id of added portfolio')
		}
		return data.id
	}

	async addInvestment(investment: Omit<Investment, MetaFields>) {
		const { data, error } = await supabase
			.from(investmentTable)
			.insert(investment)
			.select('id')
			.single()

		if (error) {
			console.error('Failed to add investment', error)
			throw new Error(error.message)
		}
		if (data.id === null) {
			console.error('Failed to get id of added investment', error)
			throw new Error('Failed to get id of added investment')
		}
		return data.id
	}

	get clients(): ClientStore {
		return this.clientsStore
	}
}
