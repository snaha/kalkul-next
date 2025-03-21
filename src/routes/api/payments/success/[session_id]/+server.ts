import { stripe } from '$lib/payments/stripe'
import { json } from '@sveltejs/kit'

export async function GET({ params }) {
	try {
		const { session_id } = params
		if (!session_id) {
			return json('missing session_id', { status: 400 })
		}

		const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)
		if (checkoutSession.mode !== 'subscription') {
			throw Error('not subscription')
		}

		const subscriptionId = checkoutSession.subscription
		if (!subscriptionId || typeof subscriptionId !== 'string') {
			throw Error('missing subscriptionId')
		}
		const subscription = await stripe.subscriptions.retrieve(subscriptionId)

		return json({ subscription })
	} catch (error) {
		console.error(error)
		return json({ error }, { status: 500 })
	}
}
