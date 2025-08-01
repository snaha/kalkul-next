import { jsonError } from '$lib/error'
import { marketstackEodResponseSchema } from '$lib/schemas'
import { json } from '@sveltejs/kit'
import { addDays, endOfYear, format, isWeekend, startOfYear, subYears } from 'date-fns'
import { subDays } from 'date-fns'
import { MARKETSTACK_API_KEY } from '$env/static/private'

const MARKETSTACK_ENDPOINT = 'https://api.marketstack.com/v2/eod'

async function fetchEodFromMarketstack(date: Date, symbolList: string[]) {
	const formattedDate = format(date, 'yyyy-MM-dd')
	const safeSymbols = symbolList.map(encodeURIComponent).join(',')
	const url = `${MARKETSTACK_ENDPOINT}/${formattedDate}?access_key=${MARKETSTACK_API_KEY}&symbols=${safeSymbols}`
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const jsonResponse = await response.json()
	const value = marketstackEodResponseSchema.safeParse(jsonResponse)

	if (value.error) {
		throw value.error
	}

	if ('error' in value.data) {
		if (value.data.error.code === 'no_valid_symbols_provided') {
			return undefined
		}
		throw value.data.error.code
	}

	if (value.data.data.length === 0) {
		return undefined
	}

	const eodResponse: Record<string, number> = {}

	value.data.data.forEach((data) => (eodResponse[data.symbol] = data.adj_close))

	return eodResponse
}

function calculateAPY(laterClosingPrice: number, earlierClosingPrice: number, numYears: number) {
	const apy = Math.pow(laterClosingPrice / earlierClosingPrice, 1 / numYears) - 1
	return apy * 100
}

function getBusinessDay(date: Date, direction: 'forward' | 'backward') {
	let businessDay = date

	const moveDate = direction === 'forward' ? addDays : subDays

	while (isWeekend(businessDay)) {
		businessDay = moveDate(businessDay, 1)
	}

	return businessDay
}

// Returns with the first date from the list that was successful
async function tryGetEodFromMarketstack(symbolList: string[], now: Date, years: number[]) {
	for (const year of years) {
		const date = getBusinessDay(addDays(startOfYear(subYears(now, year)), 1), 'forward')
		const result = await fetchEodFromMarketstack(date, symbolList)
		if (!result) {
			continue
		}
		return { result, year }
	}
}

// This function heuristically tries to find two dates in the past
// in order to calculate the APY
async function tryGetEodFromMarketstackForTwoDates(symbolList: string[]) {
	const now = new Date()
	const lastDayOfPreviousYear = getBusinessDay(endOfYear(subYears(now, 1)), 'backward')
	const laterDate = await fetchEodFromMarketstack(lastDayOfPreviousYear, symbolList)

	if (!laterDate) {
		return { earlierDate: undefined, laterDate: undefined, numYears: 0 }
	}

	const result = await tryGetEodFromMarketstack(symbolList, now, [9, 5, 1])

	if (!result) {
		return { earlierDate: undefined, laterDate: undefined, numYears: 0 }
	}

	const earlierDate = result.result
	const numYears = result.year

	return { earlierDate, laterDate, numYears }
}

export async function GET({ params }) {
	try {
		const { symbols } = params
		if (!symbols) {
			return jsonError('missing identifier', 400)
		}

		// TODO validate symbols to avoid API injection
		const symbolList = symbols.split(',').map(decodeURIComponent)

		const { earlierDate, laterDate, numYears } =
			await tryGetEodFromMarketstackForTwoDates(symbolList)

		const apyResponse: Record<string, number> = {}

		if (earlierDate && laterDate) {
			symbolList.forEach(
				(symbol) =>
					(apyResponse[symbol] = calculateAPY(laterDate[symbol], earlierDate[symbol], numYears)),
			)
		}

		return json(apyResponse)
	} catch (error) {
		console.error(error)
		return jsonError(error, 500)
	}
}
