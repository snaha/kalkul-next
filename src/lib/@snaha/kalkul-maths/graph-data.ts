import Decimal from 'decimal.js'
import { type Investment, type Portfolio, type Transaction } from '$lib/types'
import {
	type PortfolioPeriodCount,
	type PortfolioPeriod,
	type GraphData,
	type InvestmentData,
} from './types'
import { differenceInDays, differenceInYears } from 'date-fns'
import { getInvestmentValues, getBaseData } from './investment-calculations'
import type { FeeBreakdown } from './investment-calculations'
import { DECIMAL_1, DAYS_PER_YEAR, MONTHS_PER_YEAR } from './constants'

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
		exhaustionDate,
		missingAmount,
	} = getInvestmentValues(
		{ period, count },
		{ deposits, withdrawals, startDate, endDate },
		investment,
	)

	const graphFeeValues = fees.map((fee) => -getTotalFeeValue(fee))

	// Build record dates aligned with getInvestmentValues snapshots (calendar period ends)
	const recordDates: Date[] = []
	if (period === 'year') {
		let rd = new Date(startDate.getFullYear(), MONTHS_PER_YEAR - 1, 31)
		while (rd <= endDate) {
			recordDates.push(rd)
			const nextYear = rd.getFullYear() + count
			rd = new Date(nextYear, MONTHS_PER_YEAR - 1, 31)
		}
	} else {
		// month
		let rd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
		while (rd <= endDate) {
			recordDates.push(rd)
			let nextMonth = rd.getMonth() + count
			let nextYear = rd.getFullYear()
			while (nextMonth > 11) {
				nextYear += 1
				nextMonth -= MONTHS_PER_YEAR
			}
			rd = new Date(nextYear, nextMonth + 1, 0)
		}
	}
	// Calculate inflation-adjusted values alongside nominal values for optimal performance
	const graphInflationDeposits: number[] = []
	const graphInflationWithdrawals: number[] = []
	const graphInflationInvestmentValues: number[] = []
	const graphInflationFeeValues: number[] = []

	const depositEntries = Array.from(deposits.entries())
	const withdrawalEntries = Array.from(withdrawals.entries())

	for (let i = 0; i < graphLabels.length; i++) {
		const rd = recordDates[i] ?? endDate
		const years = differenceInDays(rd, startDate) / DAYS_PER_YEAR
		const inflationAtRecord = DECIMAL_1.add(portfolio.inflation_rate).pow(years)

		// Calculate period boundaries for deposits/withdrawals
		let periodStart: Date
		let periodEnd: Date
		if (period === 'year') {
			periodStart = new Date(rd.getFullYear(), 0, 1)
			periodEnd = new Date(rd.getFullYear(), MONTHS_PER_YEAR - 1, 31)
		} else {
			periodStart = new Date(rd.getFullYear(), rd.getMonth(), 1)
			periodEnd = new Date(rd.getFullYear(), rd.getMonth() + 1, 0)
		}

		// Process deposits for this period (convert to real terms using baseline date)
		let depSum = 0
		for (const [date, amount] of depositEntries) {
			const d = new Date(date)
			if (d >= periodStart && d <= periodEnd) {
				// Calculate inflation from baseline date to transaction date
				const yearsAtEvent = differenceInDays(d, startDate) / DAYS_PER_YEAR
				const inflationAtEvent = DECIMAL_1.add(portfolio.inflation_rate).pow(yearsAtEvent)
				// Convert nominal amount to real value at baseline date
				depSum += new Decimal(amount).div(inflationAtEvent).toNumber()
			}
		}

		// Process withdrawals for this period (convert to real terms using baseline date)
		let wdSum = 0
		for (const [date, amount] of withdrawalEntries) {
			const d = new Date(date)
			if (d >= periodStart && d <= periodEnd) {
				// Calculate inflation from baseline date to transaction date
				const yearsAtEvent = differenceInDays(d, startDate) / DAYS_PER_YEAR
				const inflationAtEvent = DECIMAL_1.add(portfolio.inflation_rate).pow(yearsAtEvent)
				// Convert nominal amount to real value at baseline date
				wdSum += new Decimal(amount).div(inflationAtEvent).toNumber()
			}
		}

		// Store both nominal and inflation-adjusted values
		graphInflationDeposits.push(depSum)
		graphInflationWithdrawals.push(-wdSum) // Graph withdrawals are negative by convention

		// Convert investment values and fees to real terms at record date
		graphInflationInvestmentValues.push(
			new Decimal(graphInvestmentValues[i] ?? 0).div(inflationAtRecord).toNumber(),
		)
		graphInflationFeeValues.push(
			new Decimal(graphFeeValues[i] ?? 0).div(inflationAtRecord).toNumber(),
		)
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
		exhaustionDate,
		missingAmount,
	}
}

// (removed) getRateAdjustment: superseded by day-accurate deflation logic

function getCumulativeSum(array: number[], index: number): number {
	return array.slice(0, index + 1).reduce((acc, val) => acc + val, 0)
}

export interface CumulativeValues {
	cumulativeDeposits: number
	cumulativeWithdrawals: number
	cumulativeFees: number
	currentValue: number
	cumulativeInterest: number
}

export function getCumulativeValues(
	graphData: GraphData,
	index: number,
	useInflation = false,
): CumulativeValues {
	const deposits = useInflation ? graphData.graphInflationDeposits : graphData.graphDeposits
	const withdrawals = useInflation
		? graphData.graphInflationWithdrawals
		: graphData.graphWithdrawals
	const fees = useInflation ? graphData.graphInflationFeeValues : graphData.graphFeeValues
	const values = useInflation
		? graphData.graphInflationInvestmentValues
		: graphData.graphInvestmentValues

	const cumulativeDeposits = getCumulativeSum(deposits, index)
	const cumulativeWithdrawals = getCumulativeSum(withdrawals, index)
	const cumulativeFees = getCumulativeSum(fees, index)
	const currentValue = values[index]

	let cumulativeInterest = 0
	for (let i = 0; i <= index; i++) {
		const valueChange = i === 0 ? values[i] : values[i] - values[i - 1]
		const periodDeposits = deposits[i] || 0
		const periodWithdrawals = withdrawals[i] || 0
		const periodFees = fees[i] || 0

		const periodInterest = valueChange - periodDeposits - periodWithdrawals - periodFees
		cumulativeInterest += periodInterest
	}

	return {
		cumulativeDeposits,
		cumulativeWithdrawals,
		cumulativeFees,
		currentValue,
		cumulativeInterest,
	}
}

// Simple hash function for cache keys
function createHash(data: unknown): string {
	const dataToHash = JSON.stringify(data)

	// Simple string hash function - more reliable than btoa for large data
	let hash = 0
	for (let i = 0; i < dataToHash.length; i++) {
		const char = dataToHash.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32-bit integer
	}

	return Math.abs(hash).toString(36)
}

// Cache for computed graph data to avoid recalculation on inflation toggle
const portfolioDataCache = new Map<
	string,
	{ data: GraphData[]; total: GraphData; timestamp: number }
>()

function getPortfolioCacheKey(
	transactions: Transaction[],
	investments: Investment[],
	portfolio: Portfolio,
): string {
	// Hash the complete data structures - any new field will automatically invalidate cache
	return createHash({
		transactions: transactions,
		investments: investments,
		portfolio: portfolio,
	})
}

export function getGraphDataForPortfolio(
	transactions: Transaction[],
	investments: Investment[],
	portfolio: Portfolio,
): {
	total: GraphData
	data: GraphData[]
} {
	const cacheKey = getPortfolioCacheKey(transactions, investments, portfolio)
	const now = Date.now()

	// Check cache and return if valid (cache for 5 minutes)
	const cached = portfolioDataCache.get(cacheKey)
	if (cached && now - cached.timestamp < 5 * 60 * 1000) {
		return { data: cached.data, total: cached.total }
	}

	const baseData = investments.map((i) => {
		const filteredTransactions = transactions.filter((t) => t.investment_id === i.id)
		return {
			baseData: getBaseData(filteredTransactions, portfolio.inflation_rate, portfolio.start_date),
			investment: i,
		}
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

	// Always calculate both variants - showInflation parameter is now ignored here
	// The UI will choose which arrays to display
	const data = baseData.map((d) =>
		getGraphData({ ...d.baseData, startDate, endDate }, d.investment, portfolio),
	)

	// Determine earliest exhaustion date and aggregate missing amounts
	let portfolioExhaustionDate: Date | undefined
	let totalMissingAmount = 0

	for (const investmentData of data) {
		if (investmentData.exhaustionDate) {
			if (!portfolioExhaustionDate || investmentData.exhaustionDate < portfolioExhaustionDate) {
				portfolioExhaustionDate = investmentData.exhaustionDate
			}
		}
		totalMissingAmount += investmentData.missingAmount
	}

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
		exhaustionDate: portfolioExhaustionDate,
		missingAmount: totalMissingAmount,
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

	// Cache the result
	portfolioDataCache.set(cacheKey, { data, total, timestamp: now })

	return { data, total }
}
