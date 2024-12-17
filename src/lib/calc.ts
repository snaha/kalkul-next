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
			date = incrementDate(date, transaction.repeat_unit as Frequency, transaction.repeat)
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
	const days = differenceInDays(endDate, startDate)
	if (days < 100) return { frequency: 'day', count: 1 }
	if (days < 200) return { frequency: 'day', count: 2 }
	if (days < 300) return { frequency: 'day', count: 3 }
	if (days < 400) return { frequency: 'day', count: 4 }
	if (days < 500) return { frequency: 'day', count: 5 }
	if (days < 600) return { frequency: 'day', count: 6 }

	// Weeks
	if (days < 700) return { frequency: 'week', count: 1 }
	if (days < 1400) return { frequency: 'week', count: 2 }
	if (days < 2100) return { frequency: 'week', count: 3 }
	if (days < 2800) return { frequency: 'week', count: 4 }

	// Months
	const months = differenceInMonths(endDate, startDate)
	if (months < 100) return { frequency: 'month', count: 1 }
	if (months < 200) return { frequency: 'month', count: 2 }
	if (months < 300) return { frequency: 'month', count: 3 }
	if (months < 600) return { frequency: 'month', count: 6 }

	// Years
	const years = endDate.getFullYear() - startDate.getFullYear()
	return { frequency: 'year', count: Math.max(1, Math.floor(years / 100)) }
}

export function getBaseData(transactions: Transaction[]): InvestmentData {
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

export function getGraphData(
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
		portfolio,
	)

	return {
		label: investment.name,
		graphLabels,
		graphDeposits,
		graphWithdrawals,
		graphInvestmentValue,
	}
}

export function getGraphDataForPortfolio(
	transactionStore: TransactionStore,
	investments: Investment[],
	portfolio: Portfolio,
): GraphData[] {
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
			startDate: baseData[0]?.baseData.startDate ?? new Date(),
			endDate: baseData[0]?.baseData.endDate ?? new Date(),
		},
	)

	return baseData.map((d) =>
		getGraphData({ ...d.baseData, startDate, endDate }, d.investment, portfolio),
	)
}

function getInvestmentValues(
	{ frequency, count }: Arity,
	{ deposits, withdrawals, startDate, endDate }: InvestmentData,
	investment: Investment,
	portfolio: Portfolio,
): number[] {
	// TODO: add fees into the calculation
	const portfolioData: number[] = []

	let currentValue = new Decimal(0)
	const apy = c1.add(new Decimal(investment.apy ?? 0).div(c100))
	const inflation = c1.add(portfolio.inflation_rate)
	const dailyAPY = apy.pow(1 / 365.25)
	const dailyInflation = c1.sub(inflation.pow(1 / 365.25)).add(c1)

	const gain = dailyAPY.mul(dailyInflation)

	let nextRecordDate = startDate

	for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
		currentValue = currentValue
			.mul(gain)
			.add(deposits.get(formatDate(date)) ?? 0)
			.sub(withdrawals.get(formatDate(date)) ?? 0)
		if (date >= nextRecordDate) {
			nextRecordDate = incrementDate(date, frequency, count)
			portfolioData.push(currentValue.toNumber())
		}
	}

	return portfolioData
}
