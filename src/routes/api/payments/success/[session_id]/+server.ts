import { stripe } from '$lib/payments/stripe'
import { serviceAdapter } from '$lib/adapters/service'
import { json } from '@sveltejs/kit'
import { jsonError } from '$lib/error'

export async function GET({ params, locals }) {
	try {
		const { session_id } = params
		if (!session_id) {
			return jsonError('Missing session_id')
		}

		const user = locals.user
		if (!user?.id) {
			return jsonError('Unauthorized', { status: 401 })
		}

		const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)
		if (checkoutSession.mode !== 'subscription') {
			return jsonError('Invalid session mode - not a subscription')
		}

		const subscriptionId = checkoutSession.subscription
		if (!subscriptionId || typeof subscriptionId !== 'string') {
			return jsonError('Missing subscription ID from checkout session')
		}
		const subscription = await stripe.subscriptions.retrieve(subscriptionId)

		// Store subscription in database for faster future access
		await serviceAdapter.upsertStripeSubscription(user.id, subscription)

		return json({ subscription })
	} catch (error) {
		console.error(error)
		return jsonError('Failed to process payment success', { status: 500, cause: error })
	}
}
