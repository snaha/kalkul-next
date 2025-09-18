import { jsonError } from '$lib/error'
import { marketstackIndexInfoResponseSchema, type MarketstackIndexInfoSchema } from '$lib/schemas'
import { json } from '@sveltejs/kit'
import { MARKETSTACK_API_KEY } from '$env/static/private'

const MARKETSTACK_ENDPOINT = 'https://api.marketstack.com/v2/indexinfo'

const indexTickerMapping: Record<string, string> = {
	'SPX Index': 'us500',
}

async function fetchIndexInfo(index: string): Promise<MarketstackIndexInfoSchema | undefined> {
	const url = `${MARKETSTACK_ENDPOINT}?access_key=${MARKETSTACK_API_KEY}&index=${index}`
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const jsonResponse = await response.json()
	const value = marketstackIndexInfoResponseSchema.safeParse(jsonResponse)

	if (value.error) {
		throw value.error
	}

	if ('error' in value.data) {
		if (value.data.error.code === 'no_valid_symbols_provided') {
			return undefined
		}
		throw value.data.error.code
	}

	if (value.data.length !== 1) {
		return undefined
	}

	return value.data[0]
}

function indexInfoPercentageToPercentage(percentage: string) {
	if (!percentage.endsWith('%')) {
		return undefined
	}

	percentage = percentage.slice(0, -1)

	const percentageNumber = parseFloat(percentage)
	if (Number.isNaN(percentageNumber)) {
		return undefined
	}

	return percentageNumber
}

export async function GET({ params }) {
	try {
		const { symbols } = params
		if (!symbols) {
			return jsonError('missing identifier')
		}

		const symbolList = symbols.split(',').map(decodeURIComponent)

		const apyResponse: Record<string, number> = {}

		for (const symbol of symbolList) {
			const index = indexTickerMapping[symbol]
			if (!index) {
				continue
			}
			const indexInfo = await fetchIndexInfo(index)
			if (!indexInfo) {
				continue
			}
			const apy = indexInfoPercentageToPercentage(indexInfo?.percentage_year)
			if (!apy) {
				continue
			}
			apyResponse[symbol] = apy
		}

		return json(apyResponse)
	} catch (error) {
		console.error(error)
		return jsonError('error while getting index data', { status: 500, cause: error })
	}
}
