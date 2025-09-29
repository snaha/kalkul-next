import type { Store } from '$lib/types'
import type { StripeSubscription } from '$lib/types'

export interface SubscriptionStore extends Store<StripeSubscription> {
	data: StripeSubscription[]
	customer: string | undefined
	loading: boolean
	error: string | undefined
	reset: () => void
	getActiveSubscription: () => StripeSubscription | undefined
}

export function withSubscriptionStore(): SubscriptionStore {
	let data = $state<StripeSubscription[]>([])
	let customer = $state<string>()
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
