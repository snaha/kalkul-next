import { stripe } from '$lib/payments/stripe'
import { json } from '@sveltejs/kit'

export async function GET({ params }) {
	try {
		const { price_id } = params
		if (!price_id) {
			return json('missing price_id', { status: 400 })
		}

		const price = await stripe.prices.retrieve(price_id)

		if (!price) {
			throw Error('price not found')
		}

		return json(price)
	} catch (error) {
		console.error(error)
		return json({ error }, { status: 500 })
	}
}
