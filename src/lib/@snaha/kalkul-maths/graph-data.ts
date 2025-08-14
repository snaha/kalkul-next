import Decimal from 'decimal.js'
import { type Investment, type Portfolio } from '$lib/types'
import {
	type PortfolioPeriodCount,
	type PortfolioPeriod,
	type GraphData,
	type Period,
	type InvestmentData,
} from './types'
import { differenceInYears } from 'date-fns'
import type { TransactionStore } from '$lib/stores/transaction.svelte'
import { getInvestmentValues, getBaseData } from './investment-calculations'
import type { FeeBreakdown } from './investment-calculations'
import { DECIMAL_1, DAYS_PER_YEAR, DAYS_PER_WEEK, MONTHS_PER_YEAR } from './constants'

Decimal.set({ precision: 30 })

function generateGraphDateLabels(start: Date, end: Date, period: PortfolioPeriod, count = 1) {
	const res = []
	if (period === 'year') {
		// For yearly periods, generate labels based on calendar years
		const startYear = start.getFullYear()
		const endYear = end.getFullYear()
		for (let year = startYear; year <= endYear; year += count) {
			res.push(year.toString())
		}
	} else if (period === 'month') {
		// For monthly periods, generate labels based on calendar months
		const startYear = start.getFullYear()
		const startMonth = start.getMonth()
		const endYear = end.getFullYear()
		const endMonth = end.getMonth()

		let currentYear = startYear
		let currentMonth = startMonth

		while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
			res.push(`${currentYear}-${currentMonth + 1}`)
			currentMonth += count
			if (currentMonth > 11) {
				currentYear += Math.floor(currentMonth / 12)
				currentMonth = currentMonth % 12
			}
		}
	}
	return res
}

function getSamplingPeriodCount(startDate: Date, endDate: Date): PortfolioPeriodCount {
	const years = differenceInYears(endDate, startDate)
	if (years < 5) return { period: 'month', count: 1 }

	return { period: 'year', count: 1 }
}

function getTotalFeeValue(fees: FeeBreakdown) {
	return fees.entryFee + fees.exitFee + fees.successFee + fees.managementFee + fees.TERFee
}

export function getGraphData(
	{ deposits, withdrawals, startDate, endDate }: InvestmentData,
	investment: Investment,
	portfolio: Portfolio,
): GraphData {
	const { period, count } = getSamplingPeriodCount(startDate, endDate)

	const graphLabels = generateGraphDateLabels(startDate, endDate, period, count)

	const {
		investmentValues: graphInvestmentValues,
		feeValues: fees,
		withdrawalValues: graphWithdrawals,
		depositValues: graphDeposits,
	} = getInvestmentValues(
		{ period, count },
		{ deposits, withdrawals, startDate, endDate },
		investment,
	)

	const graphFeeValues = fees.map((fee) => -getTotalFeeValue(fee))

	const inflationPerPeriod = getRateAdjustment(portfolio.inflation_rate, period, count)

	const graphInflationDeposits: number[] = []
	const graphInflationWithdrawals: number[] = []
	const graphInflationInvestmentValues: number[] = []
	const graphInflationFeeValues: number[] = []

	for (let i = 0; i < graphLabels.length; i++) {
		const inflation = inflationPerPeriod.pow(i)

		graphInflationDeposits.push(new Decimal(graphDeposits[i] ?? 0).div(inflation).toNumber())
		graphInflationWithdrawals.push(new Decimal(graphWithdrawals[i] ?? 0).div(inflation).toNumber())
		graphInflationInvestmentValues.push(
			new Decimal(graphInvestmentValues[i] ?? 0).div(inflation).toNumber(),
		)
		graphInflationFeeValues.push(new Decimal(graphFeeValues[i] ?? 0).div(inflation).toNumber())
	}

	return {
		label: investment.name,
		graphLabels,
		graphDeposits,
		graphWithdrawals,
		graphInvestmentValues,
		graphFeeValues,
		graphInflationDeposits,
		graphInflationWithdrawals,
		graphInflationInvestmentValues,
		graphInflationFeeValues,
	}
}

export function getRateAdjustment(rate: number, period: Period, count: number): Decimal {
	switch (period) {
		case 'day':
			return DECIMAL_1.add(rate)
				.pow(1 / DAYS_PER_YEAR)
				.pow(count)
		case 'week':
			return DECIMAL_1.add(rate)
				.pow(1 / DAYS_PER_YEAR)
				.pow(count * DAYS_PER_WEEK)
		case 'month':
			return DECIMAL_1.add(rate)
				.pow(1 / MONTHS_PER_YEAR)
				.pow(count)
		case 'year':
			return DECIMAL_1.add(rate).pow(count)
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
		graphInvestmentValues: [...data[0].graphInvestmentValues],
		graphFeeValues: [...data[0].graphFeeValues],

		graphInflationDeposits: [...data[0].graphInflationDeposits],
		graphInflationWithdrawals: [...data[0].graphInflationWithdrawals],
		graphInflationInvestmentValues: [...data[0].graphInflationInvestmentValues],
		graphInflationFeeValues: [...data[0].graphInflationFeeValues],
	}

	for (let i = 1; i < data.length; i++) {
		for (let j = 0; j < total.graphLabels.length; j++) {
			total.graphDeposits[j] += data[i].graphDeposits[j]
			total.graphWithdrawals[j] += data[i].graphWithdrawals[j]
			total.graphInvestmentValues[j] += data[i].graphInvestmentValues[j]
			total.graphFeeValues[j] += data[i].graphFeeValues[j]

			total.graphInflationDeposits[j] += data[i].graphInflationDeposits[j]
			total.graphInflationWithdrawals[j] += data[i].graphInflationWithdrawals[j]
			total.graphInflationInvestmentValues[j] += data[i].graphInflationInvestmentValues[j]
			total.graphInflationFeeValues[j] += data[i].graphInflationFeeValues[j]
		}
	}

	return { data, total }
}
