import { stripe } from '$lib/payments/stripe'
import { json } from '@sveltejs/kit'

export async function GET({ locals }) {
	try {
		const user = locals.user

		const customers = await stripe.customers.search({
			query: `email: "${user.email}"`,
			limit: 1,
		})

		if (customers.data.length !== 1) {
			throw new Error('cannot find customer')
		}

		const customer = customers.data[0]

		return json(customer)
	} catch (error) {
		console.error(error)
		return json({ error }, { status: 500 })
	}
}
