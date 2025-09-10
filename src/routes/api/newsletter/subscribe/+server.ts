import { CORS_ALLOWED_ORIGIN, RESEND_API_KEY, RESEND_AUDIENCE_ID } from '$env/static/private'
import { jsonError } from '$lib/error'
import { json, type RequestHandler } from '@sveltejs/kit'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(RESEND_API_KEY)
const AUDIENCE_ID = RESEND_AUDIENCE_ID
const ALLOWED_ORIGIN = CORS_ALLOWED_ORIGIN

export const POST: RequestHandler = async ({ request }) => {
	const origin = request.headers.get('origin') || request.headers.get('referer')

	if (!origin || !origin.startsWith(ALLOWED_ORIGIN)) {
		return json({ error: 'Forbidden' }, { status: 403 })
	}

	try {
		const body = await request.json()
		const res = z.string().email().safeParse(body.email)
		if (!res.success) {
			return json({ error: 'Invalid email' }, { status: 400 })
		}

		const email = res.data

		const getContactResponse = await resend.contacts.get({
			email,
			audienceId: AUDIENCE_ID,
		})
		if (getContactResponse.error) {
			return jsonError(getContactResponse.error)
		}
		const contact = getContactResponse.data

		// Contact already exist
		if (contact) {
			// Contact is already subscribed
			if (contact.unsubscribed === false) {
				return json({ success: true })
			}

			const updateContactResponse = await resend.contacts.update({
				email,
				audienceId: AUDIENCE_ID,
				unsubscribed: false,
			})

			if (updateContactResponse.error) {
				return jsonError(updateContactResponse.error)
			}

			return json({ success: true })
		}

		const createContactResponse = await resend.contacts.create({
			email,
			audienceId: AUDIENCE_ID,
			unsubscribed: false,
		})

		if (createContactResponse.error) {
			return json({ error: createContactResponse.error.message }, { status: 400 })
		} else {
			return json({ success: true })
		}
	} catch (error) {
		console.error('Resend error:', error)
		return json({ error: 'Subscription failed' }, { status: 500 })
	}
}
