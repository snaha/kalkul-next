import { PUBLIC_ORIGIN } from '$env/static/public'
import { stripe } from '$lib/payments/stripe'
import routes, { accountSections } from '$lib/routes'
import { json } from '@sveltejs/kit'

export async function GET({ params }) {
	try {
		const { customer_id } = params
		if (!customer_id) {
			return json('missing session_id', { status: 400 })
		}

		// This is the url to which the customer will be redirected when they're done
		// managing their billing with the portal.
		const returnUrl = `${PUBLIC_ORIGIN}${routes.ACCOUNT}#${accountSections.PAYMENT}`

		const portalSession = await stripe.billingPortal.sessions.create({
			customer: customer_id,
			return_url: returnUrl,
		})

		return json({ url: portalSession.url })
	} catch (error) {
		console.error(error)
		return json({ error }, { status: 500 })
	}
}
