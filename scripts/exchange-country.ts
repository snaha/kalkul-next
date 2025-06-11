/**
 * This script is working with the Bloomberg Exchange Codes mapping
 * which can be found here: https://www.inforeachinc.com/bloomberg-exchange-code-mapping
 *
 * The file is an Excel file, and the `Equity exchanges` tab has to be exported as CSV associateCountryExchangeAndCurrency
 * run with this script:
 *
 * pnpm generate-exchanges exchanges.csv
 *
 * The output of this file is saved in the `src/lib/exchanges.ts` file
 */
import fs from 'fs'

type ExchangeLine = [
	string,
	string,
	string,
	string,
	exchangeCode: string,
	string,
	string,
	country: string,
]

function associateCountryExchangeAndCurrency(
	lines: ExchangeLine[],
	countryCode: string,
	currency: string,
) {
	const filteredLines = lines.filter((line) => line[7] === countryCode.toUpperCase())

	return filteredLines.map((line) => [
		line[4],
		{
			currency,
			exchange: line[5],
			mic: line[0],
			operatingMic: line[1],
			micExchangeName: line[2],
			country: line[7],
		},
	])
}

function main() {
	const filename = process.argv[2]

	const file = fs.readFileSync(filename, 'utf-8')
	const lines = file
		.split('\n')
		.map((line) => line.split(','))
		.filter((line) => line[4] !== 'NONE') as ExchangeLine[]

	const results = [
		...associateCountryExchangeAndCurrency(lines, 'CZ', 'CZK'),
		...associateCountryExchangeAndCurrency(lines, 'US', 'USD'),
		...associateCountryExchangeAndCurrency(lines, 'AT', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'BE', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'CY', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'EE', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'FI', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'FR', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'DE', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'GR', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'IE', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'IT', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'LV', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'LT', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'LU', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'MT', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'NL', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'PT', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'SK', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'SI', 'EUR'),
		...associateCountryExchangeAndCurrency(lines, 'ES', 'EUR'),
	]

	const mapping = Object.fromEntries(results.map((result) => [result[0], result[1]]))
	console.log(mapping)
}

main()
