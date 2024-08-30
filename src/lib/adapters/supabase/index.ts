import { createClient, type Subscription as SupabaseSubscription } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Adapter } from '..'
import { withAuthStore } from '$lib/stores/auth.svelte'
import type { Client, ClientNoId } from '$lib/types'
import { withClientStore, type ClientStore } from '$lib/stores/clients.svelte'

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

const clientCollection = 'client'

interface Subscription {
	unsubscribe: () => void
}

function subscribeClients(store: ClientStore, uuid: string): Subscription {
	store.reset()

	let query = supabase.from(clientCollection).select('*')

	query = query.eq('advisor', uuid)

	query.then((res) => {
		if (res.error) {
			console.error('Error fetching data:', res.error)
		} else {
			store.data = res.data as Client[]
		}
	})

	const channel = supabase.channel(`public:${clientCollection}`)

	channel
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: clientCollection,
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
	}
}

export default class Supabase implements Adapter {
	public authStore = withAuthStore()
	private clientsStore = withClientStore()
	private clientsSubscription: Subscription | undefined = undefined
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
					}
				} else if (event === 'SIGNED_OUT') {
					this.authStore.user = null
					this.clientsSubscription?.unsubscribe()
					this.clientsSubscription = undefined
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
			console.error('Failed to create user', error)
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
		const { data, error } = await supabase
			.from(clientCollection)
			.insert(client)
			.select('id')
			.single()
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

	get clients(): ClientStore {
		return this.clientsStore
	}
}
