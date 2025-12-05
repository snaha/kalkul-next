import { CORS_ALLOWED_ORIGIN, RESEND_AUDIENCE_ID } from '$env/static/private'
import { jsonError } from '$lib/error'
import { json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'
import { createContact, getContact, updateContact } from '../resend'

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

		const getContactResponse = await getContact({
			email,
			audienceId: AUDIENCE_ID,
		})

		if (getContactResponse.error) {
			if (getContactResponse.error.name !== 'not_found') {
				return jsonError(getContactResponse.error.message, { cause: getContactResponse.error })
			}

			// Contact was not found, create one
			const createContactResponse = await createContact({
				email,
				audienceId: AUDIENCE_ID,
				unsubscribed: false,
			})

			if (createContactResponse.error) {
				return jsonError(createContactResponse.error.message, {
					cause: createContactResponse.error,
				})
			} else {
				return json({ success: true })
			}
		}

		// Contact was found
		const contact = getContactResponse.data

		// Contact already exist
		if (contact) {
			// Contact is already subscribed
			if (contact.unsubscribed === false) {
				return json({ success: true })
			}

			const updateContactResponse = await updateContact({
				email,
				audienceId: AUDIENCE_ID,
				unsubscribed: false,
			})

			if (updateContactResponse.error) {
				return jsonError(updateContactResponse.error.message, {
					cause: updateContactResponse.error,
				})
			}

			return json({ success: true })
		}

		return jsonError('missing contact data')
	} catch (error) {
		console.error('Resend error:', error)
		return jsonError('Subscription failed', { status: 500, cause: error })
	}
}
