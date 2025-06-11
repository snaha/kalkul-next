import { jsonError } from '$lib/error'
import { marketstackEodResponseSchema } from '$lib/schemas'
import { json } from '@sveltejs/kit'
import { addDays, endOfYear, format, isWeekend, startOfYear, subYears } from 'date-fns'
import { subDays } from 'date-fns'
import { MARKETSTACK_API_KEY } from '$env/static/private'

const MARKETSTACK_ENDPOINT = 'https://api.marketstack.com/v2/eod'

async function fetchEodFromMarketstack(date: Date, symbolList: string[]) {
	const formattedDate = format(date, 'yyyy-MM-dd')
	const safeSymbols = symbolList.join(',')
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
			return {}
		}
		throw value.data.error.code
	}

	const eodResponse: Record<string, number> = {}

	value.data.data.forEach((data) => (eodResponse[data.symbol] = data.adj_close))

	return eodResponse
}

function calculateAPY(closingYesterday: number, closingYearAgo: number) {
	const apy = closingYesterday / closingYearAgo - 1
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

export async function GET({ params }) {
	try {
		const { symbols } = params
		if (!symbols) {
			return jsonError('missing identifier', 400)
		}

		// TODO validate symbols to avoid API injection
		const symbolList = symbols.split(',')

		const now = new Date()
		const lastDayOfPreviousYear = getBusinessDay(endOfYear(subYears(now, 1)), 'backward')
		const lastDayOfPreviousYearResponse = await fetchEodFromMarketstack(
			lastDayOfPreviousYear,
			symbolList,
		)

		const firstDayOfPreviousYear = getBusinessDay(
			addDays(startOfYear(subYears(now, 1)), 1),
			'forward',
		)
		const firstDayOfPreviousYearResponse = await fetchEodFromMarketstack(
			firstDayOfPreviousYear,
			symbolList,
		)

		const apyResponse: Record<string, number> = {}

		symbolList.forEach(
			(symbol) =>
				(apyResponse[symbol] = calculateAPY(
					lastDayOfPreviousYearResponse[symbol],
					firstDayOfPreviousYearResponse[symbol],
				)),
		)

		return json(apyResponse)
	} catch (error) {
		console.error(error)
		return jsonError(error, 500)
	}
}
