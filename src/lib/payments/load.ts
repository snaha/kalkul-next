import { PUBLIC_DISABLE_PAYWALL } from '$env/static/public'
import { authorizedFetch } from '$lib/auth'
import { apiRoutes } from '$lib/routes'
import { subscriptionStore } from '$lib/stores/subscription.svelte'
import type { StripeSubscription } from '$lib/types'

export async function loadSubscriptions() {
	try {
		subscriptionStore.reset()

		if (PUBLIC_DISABLE_PAYWALL === 'true') {
			return
		}

		const subscriptionsResponse = await authorizedFetch(apiRoutes.SUBSCRIPTIONS)
		if (!subscriptionsResponse.ok) {
			const subscriptionResponseError = await subscriptionsResponse.text()
			throw new Error(subscriptionResponseError)
		}

		const subscriptions = (await subscriptionsResponse.json()) as StripeSubscription[]

		if (subscriptions.length === 0) {
			return
		}

		// Get customer ID from the first subscription (all subscriptions belong to same customer)
		const customerId = subscriptions[0].stripe_customer_id
		if (!customerId || typeof customerId !== 'string') {
			throw new Error('Customer ID missing from subscription')
		}

		subscriptionStore.data = subscriptions
		subscriptionStore.customer = customerId
	} catch (e) {
		subscriptionStore.reset()
		subscriptionStore.error = String(e)
		console.error({ e })
	} finally {
		subscriptionStore.loading = false
	}
}
