import {
	PUBLIC_ORIGIN,
	PUBLIC_PRODUCT_EARLY_BIRD_PRICE_ID,
	PUBLIC_PRODUCT_PRICE_ID,
	PUBLIC_PRODUCT_TRIAL_DAYS,
} from '$env/static/public'
import { stripe } from '$lib/payments/stripe'
import { json } from '@sveltejs/kit'

async function getSubscriptionParameters(email: string): Promise<{
	price: string
	trial_period_days: number | undefined
	customer: string | undefined
	customer_email: string | undefined
}> {
	const defaultParameters = {
		customer: undefined,
		price: PUBLIC_PRODUCT_EARLY_BIRD_PRICE_ID,
		trial_period_days: parseInt(PUBLIC_PRODUCT_TRIAL_DAYS, 10),
		customer_email: email,
	}

	const customers = await stripe.customers.search({
		query: `email: "${email}"`,
		limit: 1,
		expand: ['data.subscriptions'],
	})

	const customer = customers.data[0]
	if (!customer) {
		return defaultParameters
	}

	// Subscriptions are already included via expand: ['data.subscriptions']
	const subscriptions = customer.subscriptions?.data || []

	if (subscriptions.length === 0) {
		return {
			...defaultParameters,
			customer: customer.id,
		}
	}

	return {
		price: PUBLIC_PRODUCT_PRICE_ID,
		trial_period_days: undefined,
		customer: customer.id,
		customer_email: undefined,
	}
}

export async function POST({ request, locals }) {
	try {
		const { locale, currency } = await request.json()

		const email = locals.user.email
		if (!email) {
			throw new Error('missing email')
		}

		const { price, trial_period_days, customer, customer_email } =
			await getSubscriptionParameters(email)

		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			line_items: [
				{
					price,
					quantity: 1,
				},
			],
			currency,
			success_url: `${PUBLIC_ORIGIN}/payments/success/{CHECKOUT_SESSION_ID}`,
			cancel_url: `${PUBLIC_ORIGIN}/payments`,
			locale: locale || 'auto',
			billing_address_collection: 'required',
			customer,
			customer_email,
			subscription_data: {
				trial_period_days,
			},
		})

		if (!session.url) {
			throw new Error('invalid session url', { cause: session })
		}

		return json({ url: session.url })
	} catch (error) {
		console.error(error)
		return json({ error }, { status: 500 })
	}
}
