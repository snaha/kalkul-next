import type { Store } from '$lib/types'
import Stripe from 'stripe'

export interface SubscriptionStore extends Store<Stripe.Subscription> {
	data: Stripe.Subscription[]
	customer: Stripe.Customer | undefined
	loading: boolean
	error: string | undefined
	reset: () => void
	getActiveSubscription: () => Stripe.Subscription | undefined
}

export function withSubscriptionStore(): SubscriptionStore {
	let data = $state<Stripe.Subscription[]>([])
	let customer = $state<Stripe.Customer>()
	let loading = $state(true)
	let error = $state(undefined)

	return {
		get data() {
			return data
		},
		set data(newValue) {
			data = newValue
			loading = false
		},
		get customer() {
			return customer
		},
		set customer(newValue) {
			customer = newValue
		},
		get loading() {
			return loading
		},
		set loading(newValue) {
			loading = newValue
		},
		get error() {
			return error
		},
		set error(newValue) {
			error = newValue
		},
		reset() {
			data = []
			customer = undefined
			loading = true
			error = undefined
		},
		getActiveSubscription() {
			return data.find(
				(subscription) => subscription.status === 'active' || subscription.status === 'trialing',
			)
		},
	}
}

export const subscriptionStore = withSubscriptionStore()
