import { authorizedFetch } from '$lib/auth'
import { subscriptionStore } from '$lib/stores/subscription.svelte'
import type Stripe from 'stripe'

export async function loadSubscriptions() {
	try {
		subscriptionStore.reset()

		const subscriptionsResponse = await authorizedFetch('/api/payments/subscriptions')
		if (!subscriptionsResponse.ok) {
			subscriptionStore.data = []
			return
		}

		const subscriptions = (await subscriptionsResponse.json()) as Stripe.Subscription[]
		subscriptionStore.data = subscriptions

		const response = await authorizedFetch('/api/payments/customer')

		if (!response.ok) {
			return
		}

		const customer = (await response.json()) as Stripe.Customer

		subscriptionStore.customer = customer.id
	} catch (e) {
		subscriptionStore.reset()
		subscriptionStore.error = String(e)
		console.error({ e })
	} finally {
		subscriptionStore.loading = false
	}
}
