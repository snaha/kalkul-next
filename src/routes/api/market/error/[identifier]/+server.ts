import { jsonError } from '$lib/error'
import { json } from '@sveltejs/kit'
import { serviceAdapter } from '$lib/adapters/service'

export async function POST({ params, request }) {
	try {
		const { identifier } = params
		if (!identifier) {
			return jsonError('missing identifier', 400)
		}

		const error = await request.json()
		await serviceAdapter.addISINError(identifier, error)

		return json({ success: true })
	} catch (error) {
		console.error(error)
		return jsonError(error, 500)
	}
}
