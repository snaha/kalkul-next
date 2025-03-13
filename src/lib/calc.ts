import Decimal from 'decimal.js'
import type {
	Frequency,
	Investment,
	Portfolio,
	Transaction,
	Arity,
	GraphData,
	InvestmentData,
} from './types'
import { formatDate } from './utils'
import {
	differenceInDays,
	differenceInMonths,
	addDays,
	addWeeks,
	addMonths,
	addYears,
	differenceInWeeks,
	differenceInYears,
} from 'date-fns'
import type { TransactionStore } from './stores/transaction.svelte'

Decimal.set({ precision: 30 })

// Common constants that help calculating with percentages
const c1 = new Decimal(1)
const c100 = new Decimal(100)

function incrementDate(date: Date, frequency: Frequency, count = 1) {
	switch (frequency) {
		case 'day':
			return addDays(date, count)
		case 'week':
			return addWeeks(date, count)
		case 'month':
			return addMonths(date, count)
		case 'year':
			return addYears(date, count)
	}
}

function addTransactionToMap(date: string, amount: number, map: Map<string, number>) {
	const dateString = date
	const existingTransaction = map.get(dateString) ?? 0
	map.set(dateString, existingTransaction + amount)
}

function processTransactionToMap(transaction: Transaction, map: Map<string, number>) {
	if (transaction.repeat === null) {
		addTransactionToMap(formatDate(new Date(transaction.date)), transaction.amount, map)
	} else if (
		transaction.repeat_unit !== null &&
		transaction.repeat !== null &&
		transaction.end_date !== null
	) {
		for (
			let date = new Date(transaction.date);
			date <= new Date(transaction.end_date);
			date = incrementDate(date, transaction.repeat_unit, transaction.repeat)
		) {
			addTransactionToMap(formatDate(date), transaction.amount, map)
		}
	}
}

function transactionsToMap(transactions: Transaction[]) {
	const map = new Map<string, number>()
	for (const t of transactions) {
		processTransactionToMap(t, map)
	}
	return map
}

function transactionMapToGraphArray(
	values: Map<string, number>,
	start: Date,
	end: Date,
	frequency: Frequency,
	count = 1,
): number[] {
	const res = []
	for (let date = new Date(start); date <= end; date = incrementDate(date, frequency, count)) {
		let value = 0
		for (
			let d = new Date(date);
			d < incrementDate(date, frequency, count);
			d = incrementDate(d, 'day', 1)
		) {
			const amount = values.get(formatDate(d)) ?? 0
			value += amount
		}
		res.push(value)
	}
	return res
}

function generateGraphDateLabels(start: Date, end: Date, frequency: Frequency, count = 1) {
	const res = []
	for (let date = new Date(start); date <= end; date = incrementDate(date, frequency, count)) {
		if (frequency === 'year') res.push(date.getFullYear().toString())
		else if (frequency === 'month') res.push(`${date.getFullYear()}-${date.getMonth() + 1}`)
		else res.push(formatDate(date))
	}
	return res
}

function getInvestmentStartAndEndDates(transaction: Transaction[]) {
	if (transaction.length === 0) return { startDate: new Date(), endDate: new Date() }

	let startDate = new Date(transaction[0].date)
	let endDate = new Date(transaction[0].end_date ?? transaction[0].date)

	for (const tx of transaction) {
		const sd = new Date(tx.date)
		const ed = tx.end_date ? new Date(tx.end_date) : sd
		startDate = sd < startDate ? sd : startDate
		endDate = ed > endDate ? ed : endDate
	}
	return { startDate, endDate }
}

function getSamplingFrequencyAndCount(startDate: Date, endDate: Date): Arity {
	const years = differenceInYears(endDate, startDate)
	if (years < 5) return { frequency: 'month', count: 1 }

	return { frequency: 'year', count: 1 }
}

function getBaseData(transactions: Transaction[]): InvestmentData {
	const { startDate, endDate } = getInvestmentStartAndEndDates(transactions)
	const deposits = transactionsToMap(
		transactions.filter((transaction) => transaction.type === 'deposit'),
	)
	const withdrawals = transactionsToMap(
		transactions.filter((transaction) => transaction.type === 'withdrawal'),
	)

	return {
		startDate,
		endDate,
		deposits,
		withdrawals,
	}
}

function getGraphData(
	{ deposits, withdrawals, startDate, endDate }: InvestmentData,
	investment: Investment,
	portfolio: Portfolio,
): GraphData {
	const { frequency, count } = getSamplingFrequencyAndCount(startDate, endDate)

	const graphLabels = generateGraphDateLabels(startDate, endDate, frequency, count)
	const graphDeposits = transactionMapToGraphArray(deposits, startDate, endDate, frequency, count)
	const graphWithdrawals = transactionMapToGraphArray(
		withdrawals,
		startDate,
		endDate,
		frequency,
		count,
	).map((v) => -v)
	const graphInvestmentValue = getInvestmentValues(
		{ frequency, count },
		{ deposits, withdrawals, startDate, endDate },
		investment,
	)

	const inflationPerPeriod = getInflationAdjustment(portfolio.inflation_rate, frequency, count)

	const graphInflationDeposits: number[] = []
	const graphInflationWithdrawals: number[] = []
	const graphInflationInvestmentValue: number[] = []

	for (let i = 0; i < graphLabels.length; i++) {
		const inflation = inflationPerPeriod.pow(i)

		graphInflationDeposits.push(new Decimal(graphDeposits[i]).div(inflation).toNumber())
		graphInflationWithdrawals.push(new Decimal(graphWithdrawals[i]).div(inflation).toNumber())
		graphInflationInvestmentValue.push(
			new Decimal(graphInvestmentValue[i]).div(inflation).toNumber(),
		)
	}

	return {
		label: investment.name,
		graphLabels,
		graphDeposits,
		graphWithdrawals,
		graphInvestmentValue,
		graphInflationDeposits,
		graphInflationWithdrawals,
		graphInflationInvestmentValue,
	}
}

function getInflationAdjustment(
	inflationRate: number,
	frequency: Frequency,
	count: number,
): Decimal {
	switch (frequency) {
		case 'day':
			return c1
				.add(inflationRate)
				.pow(1 / 365.25)
				.pow(count)
		case 'week':
			return c1
				.add(inflationRate)
				.pow(1 / 365.25)
				.pow(count * 7)
		case 'month':
			return c1
				.add(inflationRate)
				.pow(1 / 12)
				.pow(count)
		case 'year':
			return c1.add(inflationRate).pow(count)
	}
}

export function getGraphDataForPortfolio(
	transactionStore: TransactionStore,
	investments: Investment[],
	portfolio: Portfolio,
): {
	total: GraphData
	data: GraphData[]
} {
	const baseData = investments.map((i) => {
		const transactions = transactionStore.filter(i.id)
		return { baseData: getBaseData(transactions), investment: i }
	})

	const { startDate, endDate } = baseData.reduce(
		(acc, i) => ({
			startDate: i.baseData.startDate < acc.startDate ? i.baseData.startDate : acc.startDate,
			endDate: i.baseData.endDate > acc.endDate ? i.baseData.endDate : acc.endDate,
		}),
		{
			startDate: new Date(portfolio.start_date),
			endDate: new Date(portfolio.end_date),
		},
	)

	const data = baseData.map((d) =>
		getGraphData({ ...d.baseData, startDate, endDate }, d.investment, portfolio),
	)

	const total: GraphData = {
		label: 'Total',
		graphLabels: [...data[0].graphLabels],
		graphDeposits: [...data[0].graphDeposits],
		graphWithdrawals: [...data[0].graphWithdrawals],
		graphInvestmentValue: [...data[0].graphInvestmentValue],

		graphInflationDeposits: [...data[0].graphInflationDeposits],
		graphInflationWithdrawals: [...data[0].graphInflationWithdrawals],
		graphInflationInvestmentValue: [...data[0].graphInflationInvestmentValue],
	}
	for (let i = 1; i < data.length; i++) {
		for (let j = 0; j < total.graphLabels.length; j++) {
			total.graphDeposits[j] += data[i].graphDeposits[j]
			total.graphWithdrawals[j] += data[i].graphWithdrawals[j]
			total.graphInvestmentValue[j] += data[i].graphInvestmentValue[j]

			total.graphInflationDeposits[j] += data[i].graphInflationDeposits[j]
			total.graphInflationWithdrawals[j] += data[i].graphInflationWithdrawals[j]
			total.graphInflationInvestmentValue[j] += data[i].graphInflationInvestmentValue[j]
		}
	}

	return { data, total }
}

function getInvestmentValues(
	{ frequency, count }: Arity,
	{ deposits, withdrawals, startDate, endDate }: InvestmentData,
	investment: Investment,
): number[] {
	// TODO: add fees into the calculation
	const portfolioData: number[] = []

	let currentValue = new Decimal(0)
	const apy = c1.add(new Decimal(investment.apy ?? 0).div(c100))
	const dailyAPY = apy.pow(1 / 365.25)

	let nextRecordDate = startDate

	for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
		currentValue = currentValue
			.mul(dailyAPY)
			.add(deposits.get(formatDate(date)) ?? 0)
			.sub(withdrawals.get(formatDate(date)) ?? 0)
		if (date >= nextRecordDate) {
			nextRecordDate = incrementDate(date, frequency, count)
			portfolioData.push(currentValue.toNumber())
		}
	}

	return portfolioData
}

export function calculateTotalAmount(transactions: Transaction[], type: string) {
	return transactions
		.filter((transaction) => transaction.type === type)
		.reduce((prev, transaction) => {
			const periods = calculateNumOccurrences(
				transaction.date,
				transaction.end_date,
				transaction.repeat_unit,
				transaction.repeat,
			)

			return prev + transaction.amount * periods
		}, 0)
}
export function calculateNumOccurrences(
	start: string,
	end?: string | null,
	repeatUnit?: string | null,
	repeat?: number | null,
): number {
	if (!end) return 1
	if (!repeatUnit || !repeat) {
		throw new Error('invalidTransactionInput')
	}

	const startDate = new Date(start)
	const endDate = new Date(end)

	switch (repeatUnit) {
		case 'day':
			return (differenceInDays(endDate, startDate) + 1) / repeat
		case 'week':
			return (differenceInWeeks(endDate, startDate) + 1) / repeat
		case 'month':
			return (differenceInMonths(endDate, startDate) + 1) / repeat
		case 'year':
			return (differenceInYears(endDate, startDate) + 1) / repeat
		default:
			throw new Error('invalidTransactionRepeatUnit')
	}
}
