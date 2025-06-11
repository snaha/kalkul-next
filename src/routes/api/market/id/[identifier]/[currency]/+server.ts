import { jsonError } from '$lib/error'
import { json } from '@sveltejs/kit'

const OPENFIGI_ENDPOINT = 'https://api.openfigi.com/v3/mapping'

function identifierIdType(identifier: string) {
	if (identifier.match(/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/)) {
		return 'ID_ISIN'
	}
	return 'TICKER'
}

export async function GET({ params }) {
	try {
		const { identifier, currency } = params
		if (!identifier) {
			return jsonError('missing identifier', 400)
		}

		if (!currency) {
			return jsonError('missing currency', 400)
		}

		const idType = identifierIdType(identifier)
		const mappingRequest = [{ idType, idValue: identifier, currency }]

		const response = await fetch(OPENFIGI_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(mappingRequest),
		})

		const jsonResponse = await response.json()
		return json(jsonResponse)
	} catch (error) {
		console.error(error)
		return jsonError(error, 500)
	}
}
