import { stripe } from '$lib/payments/stripe'
import { json } from '@sveltejs/kit'

export async function GET({ locals }) {
	try {
		const user = locals.user

		const customers = await stripe.customers.search({
			query: `email: "${user.email}"`,
			limit: 1,
			expand: ['data.subscriptions'],
		})

		if (customers.data.length !== 1) {
			return json({ error: 'Cannot find customer' }, { status: 400 })
		}

		const customer = customers.data[0]
		const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: 'all' })

		return json(subscriptions.data)
	} catch (error) {
		console.error(error)
		return json({ error }, { status: 500 })
	}
}
