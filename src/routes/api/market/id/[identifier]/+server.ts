import { jsonError } from '$lib/error'
import { json } from '@sveltejs/kit'
import { serviceAdapter } from '$lib/adapters/service'
import { subMonths } from 'date-fns'

const OPENFIGI_ENDPOINT = 'https://api.openfigi.com/v3/mapping'

function identifierIdType(identifier: string) {
	if (identifier.match(/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/)) {
		return 'ID_ISIN'
	}
	return 'TICKER'
}

async function safeGetMarketData(identifier: string, idType: string, updatedAfter: Date) {
	try {
		return await serviceAdapter.getMarketData(identifier, idType, updatedAfter)
	} catch (e) {
		console.error('Error while getting market data', { e })
		return
	}
}

async function safeAddMarketData(identifier: string, idType: string, jsonResponse: object) {
	try {
		await serviceAdapter.addMarketData(identifier, idType, jsonResponse)
	} catch (cacheStoreError) {
		console.error('Failed to store in database:', cacheStoreError)
		// Continue anyway - cache failure shouldn't break the API
	}
}

export async function GET({ params }) {
	try {
		const { identifier } = params
		if (!identifier) {
			return jsonError('missing identifier')
		}

		const idType = identifierIdType(identifier)

		// Only return cached data that is newer than a month
		const updatedAfter = subMonths(new Date(), 1)
		const cachedData = await safeGetMarketData(identifier, idType, updatedAfter)
		if (cachedData) {
			return json(cachedData)
		}

		// Cache miss - fetch from OpenFIGI
		const mappingRequest = [{ idType, idValue: identifier }]

		const response = await fetch(OPENFIGI_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(mappingRequest),
		})

		const jsonResponse = await response.json()

		// Store in cache
		await safeAddMarketData(identifier, idType, jsonResponse)

		return json(jsonResponse)
	} catch (error) {
		console.error(error)
		return jsonError('error while getting cached market data', { status: 500, cause: error })
	}
}
