import { CORS_ALLOWED_ORIGIN, RESEND_API_KEY, RESEND_AUDIENCE_ID } from '$env/static/private'
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
		const data = await resend.contacts.update({
			email: res.data,
			audienceId: AUDIENCE_ID,
			unsubscribed: true,
		})

		if (data.error) {
			return json({ error: data.error.message }, { status: 400 })
		} else {
			return json({ success: true })
		}
	} catch (error) {
		console.error('Resend error:', error)
		return json({ error: 'Unsubscribe failed' }, { status: 500 })
	}
}
