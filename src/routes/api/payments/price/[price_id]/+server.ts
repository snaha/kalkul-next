import { jsonError } from '$lib/error'
import { stripe } from '$lib/payments/stripe'
import { json } from '@sveltejs/kit'

export async function GET({ params }) {
	try {
		const { price_id } = params
		if (!price_id) {
			return jsonError('missing price_id')
		}

		const price = await stripe.prices.retrieve(price_id)

		if (!price) {
			return jsonError('price not found', { status: 404 })
		}

		return json(price)
	} catch (error) {
		console.error(error)
		return json({ error }, { status: 500 })
	}
}
