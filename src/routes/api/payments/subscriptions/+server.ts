import { stripe, needsRefresh } from '$lib/payments/stripe'
import { serviceAdapter } from '$lib/adapters/service'
import { json } from '@sveltejs/kit'
import { jsonError } from '$lib/error'

export async function GET({ locals }) {
	try {
		const user = locals.user
		if (!user?.id) {
			return jsonError('Unauthorized', { status: 401 })
		}

		// Try to get subscription from database first
		const dbSubscription = await serviceAdapter.getStripeSubscriptionByUserId(user.id)

		// If no subscription in DB or needs refresh, fetch from Stripe
		if (!dbSubscription || needsRefresh(dbSubscription)) {
			const customers = await stripe.customers.search({
				query: `email: "${user.email}"`,
				limit: 1,
				expand: ['data.subscriptions', 'data.subscriptions.data.items'],
			})

			if (customers.data.length === 0) {
				return json([])
			}

			const customer = customers.data[0]
			const stripeSubscriptions = customer.subscriptions?.data || []

			if (stripeSubscriptions.length === 0) {
				return json([])
			}

			// Update database with fresh Stripe data
			const activeSubscription = stripeSubscriptions.find((sub) =>
				['active', 'trialing'].includes(sub.status),
			)

			if (activeSubscription) {
				const dbSubscriptionResult = await serviceAdapter.upsertStripeSubscription(
					user.id,
					activeSubscription,
				)
				return json([dbSubscriptionResult])
			}

			return json([])
		}

		// Use database subscription directly
		return json([dbSubscription])
	} catch (error) {
		console.error(error)
		return jsonError('Failed to load subscriptions', { status: 500, cause: error })
	}
}
