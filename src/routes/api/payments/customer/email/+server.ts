import { stripe } from '$lib/payments/stripe'
import { json } from '@sveltejs/kit'
import { jsonError } from '$lib/error'

export async function PUT({ locals, request }) {
	try {
		const user = locals.user
		if (!user?.id) {
			return jsonError('Unauthorized', { status: 401 })
		}

		const { oldEmail, newEmail } = await request.json()
		if (!oldEmail || typeof oldEmail !== 'string') {
			return jsonError('Missing or invalid old email address')
		}
		if (!newEmail || typeof newEmail !== 'string') {
			return jsonError('Missing or invalid new email address')
		}

		// Find Stripe customer by old email
		const customers = await stripe.customers.search({
			query: `email: "${oldEmail}"`,
			limit: 1,
		})

		if (customers.data.length === 0) {
			// User doesn't have a Stripe customer yet, nothing to update
			return json({ success: true, message: 'No Stripe customer found to update' })
		}

		const customer = customers.data[0]

		// Update Stripe customer email
		const updatedCustomer = await stripe.customers.update(customer.id, {
			email: newEmail,
		})

		return json({
			success: true,
			customerId: updatedCustomer.id,
			oldEmail: oldEmail,
			newEmail: updatedCustomer.email,
		})
	} catch (error) {
		console.error('Failed to update Stripe customer email:', error)
		return jsonError('Failed to update customer email in Stripe', { status: 500, cause: error })
	}
}
