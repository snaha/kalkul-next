import Decimal from 'decimal.js'
import { type Investment, type Portfolio } from '$lib/types'
import {
	type PeriodCount,
	type GraphData,
	DEFAULT_ENTRY_FEE_TYPE,
	type EntryFeeType,
	type FeeType,
	DEFAULT_FEE_TYPE,
} from './types'
import { formatDate } from '$lib/utils'
import { addDays, differenceInYears } from 'date-fns'
import type { TransactionStore } from '$lib/stores/transaction.svelte'
import { incrementDate } from './date'
import { createTransactionMap } from './transaction-map'
import type { TransactionMap, Transaction, Period, InvestmentData } from './types'

Decimal.set({ precision: 30 })

// Common constants that help calculating with percentages
const DECIMAL_0 = new Decimal(0)
const DECIMAL_1 = new Decimal(1)

const NUM_DAYS_PER_YEAR = 365.25

function toPercentage(n: number): number {
	return n / 100
}

function feeValue(type: FeeType, value: number): number {
	switch (type) {
		case 'percentage':
			return toPercentage(value)
		case 'fixed':
			return value
	}
	return value
}

function generateGraphDateLabels(start: Date, end: Date, period: Period, count = 1) {
	const res = []
	for (let date = new Date(start); date <= end; date = incrementDate(date, period, count)) {
		if (period === 'year') res.push(date.getFullYear().toString())
		else if (period === 'month') res.push(`${date.getFullYear()}-${date.getMonth() + 1}`)
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

function getSamplingPeriodCount(startDate: Date, endDate: Date): PeriodCount {
	const years = differenceInYears(endDate, startDate)
	if (years < 5) return { period: 'month', count: 1 }

	return { period: 'year', count: 1 }
}

export function getBaseData(transactions: Transaction[]): InvestmentData {
	const { startDate, endDate } = getInvestmentStartAndEndDates(transactions)
	const deposits = createTransactionMap(
		transactions.filter((transaction) => transaction.type === 'deposit'),
	)
	const withdrawals = createTransactionMap(
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

	const inflationPerPeriod = getInflationAdjustment(portfolio.inflation_rate, period, count)

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

export function getInflationAdjustment(
	inflationRate: number,
	period: Period,
	count: number,
): Decimal {
	return getRateAdjustment(inflationRate, period, count)
}

export function getRateAdjustment(rate: number, period: Period, count: number): Decimal {
	switch (period) {
		case 'day':
			return DECIMAL_1.add(rate)
				.pow(1 / NUM_DAYS_PER_YEAR)
				.pow(count)
		case 'week':
			return DECIMAL_1.add(rate)
				.pow(1 / NUM_DAYS_PER_YEAR)
				.pow(count * 7)
		case 'month':
			return DECIMAL_1.add(rate)
				.pow(1 / 12)
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

function stringToEntryFeeType(entryFeeType: string): EntryFeeType {
	if (entryFeeType === 'forty-sixty') {
		return entryFeeType
	} else if (entryFeeType === 'upfront') {
		return entryFeeType
	} else {
		return DEFAULT_ENTRY_FEE_TYPE
	}
}

function stringToFeeType(feeType: string): FeeType {
	if (feeType === 'fixed') {
		return feeType
	} else {
		return DEFAULT_FEE_TYPE
	}
}

export interface FeeBreakdown<T = number> {
	entryFee: T
	exitFee: T
	managementFee: T
	successFee: T
	TERFee: T
}

function resetFeeBreakdown<T>(value: T): FeeBreakdown<T> {
	return {
		entryFee: value,
		exitFee: value,
		managementFee: value,
		successFee: value,
		TERFee: value,
	}
}

function convertFeeBreakdownToNumbers(fees: FeeBreakdown<Decimal>): FeeBreakdown {
	return {
		entryFee: fees.entryFee.toNumber(),
		exitFee: fees.exitFee.toNumber(),
		managementFee: fees.managementFee.toNumber(),
		successFee: fees.successFee.toNumber(),
		TERFee: fees.TERFee.toNumber(),
	}
}

function getTotalFeeValue(fees: FeeBreakdown) {
	return fees.entryFee + fees.exitFee + fees.successFee + fees.managementFee + fees.TERFee
}

/**
 * Get investment values normalized for a certain period
 *
 * @param param0 Period and count of the investment
 * @param param1 Investment data
 * @param investment Investment parameters
 * @returns An object containing the investment values, fees, withdrawals and deposits for a certain period defined by arity
 */
export function getInvestmentValues(
	{ period, count }: PeriodCount,
	{ deposits, withdrawals, startDate, endDate }: InvestmentData,
	investment: Investment,
	numDaysPerYear = NUM_DAYS_PER_YEAR,
): {
	investmentValues: number[]
	feeValues: FeeBreakdown[]
	withdrawalValues: number[]
	depositValues: number[]
} {
	const investmentValues: number[] = []
	const feeValues: FeeBreakdown[] = []
	const withdrawalValues: number[] = []
	const depositValues: number[] = []

	let currentValue = new Decimal(0)
	let currentFeeBreakdown: FeeBreakdown<Decimal> = resetFeeBreakdown(new Decimal(0))
	let withdrawal = new Decimal(0)
	let deposit = new Decimal(0)

	const { dailyAPY, dailyAPYWithSuccessFee } = calculateDailyAPY(investment, numDaysPerYear)
	const { dailyFee: dailyManagementFee, dailyFeeMultiplier: dailyManagementFeeMultiplier } =
		calculateDailyManagementFees(investment, numDaysPerYear)
	const { dailyFeeMultiplier: dailyTERFeeMulitplier } = calculateDailyFees(
		investment.ter ?? 0,
		'percentage',
		numDaysPerYear,
	)

	const totalDepositAmount = calculateTotalDepositAmount(deposits)

	let nextRecordDate = incrementDate(startDate, period, count)
	investmentValues.push(0)

	for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
		const depositsOnDate = deposits.get(formatDate(date)) ?? 0
		const withdrawalsOnDate = withdrawals.get(formatDate(date)) ?? 0

		const depositFee = calculateEntryFee(
			depositsOnDate,
			stringToEntryFeeType(investment.entry_fee_type || DEFAULT_ENTRY_FEE_TYPE),
			toPercentage(investment.entry_fee || 0),
			totalDepositAmount,
			currentValue.toNumber(),
		)

		deposit = deposit.add(depositsOnDate)

		const exitFeeType = stringToFeeType(investment.exit_fee_type || DEFAULT_FEE_TYPE)
		const withdrawalFee = calculateExitFee(
			currentValue.toNumber(),
			exitFeeType,
			withdrawalsOnDate > 0 ? feeValue(exitFeeType, investment.exit_fee || 0) : 0,
		)

		withdrawal = withdrawal.add(withdrawalsOnDate)

		const successFee = currentValue.mul(dailyAPY).sub(currentValue.mul(dailyAPYWithSuccessFee))
		const managementFee = currentValue
			.mul(dailyAPYWithSuccessFee)
			.sub(currentValue.mul(dailyAPYWithSuccessFee).mul(dailyManagementFeeMultiplier))
			.add(dailyManagementFee)

		const TERFee = currentValue
			.mul(dailyAPYWithSuccessFee)
			.sub(currentValue.mul(dailyAPYWithSuccessFee).mul(dailyTERFeeMulitplier))

		currentFeeBreakdown.entryFee = currentFeeBreakdown.entryFee.add(depositFee)
		currentFeeBreakdown.exitFee = currentFeeBreakdown.exitFee.add(withdrawalFee)
		currentFeeBreakdown.managementFee = currentFeeBreakdown.managementFee.add(managementFee)
		currentFeeBreakdown.successFee = currentFeeBreakdown.successFee.add(successFee)
		currentFeeBreakdown.TERFee = currentFeeBreakdown.TERFee.add(TERFee)

		currentValue = currentValue
			.mul(dailyAPYWithSuccessFee)
			.mul(dailyTERFeeMulitplier)
			.mul(dailyManagementFeeMultiplier)
			.sub(dailyManagementFee)
			.add(depositsOnDate - depositFee) // Deposit fee is substracted from the deposit
			.sub(withdrawalsOnDate + withdrawalFee) // The exit fee is taken from the withrawed amount

		if (date >= nextRecordDate) {
			nextRecordDate = incrementDate(date, period, count)

			investmentValues.push(currentValue.toNumber())

			feeValues.push(convertFeeBreakdownToNumbers(currentFeeBreakdown))
			currentFeeBreakdown = resetFeeBreakdown(Decimal(0))

			withdrawalValues.push(-withdrawal.toNumber())
			withdrawal = new Decimal(0)

			depositValues.push(deposit.toNumber())
			deposit = new Decimal(0)
		}
	}

	if (endDate < nextRecordDate) {
		investmentValues.push(currentValue.toNumber())
		feeValues.push(convertFeeBreakdownToNumbers(currentFeeBreakdown))
		withdrawalValues.push(-withdrawal.toNumber())
		depositValues.push(deposit.toNumber())
	}

	return { investmentValues, feeValues, withdrawalValues, depositValues }
}

export function calculateTotalDepositAmount(deposits: TransactionMap): number {
	let total = 0
	for (const [, amount] of deposits) {
		total += amount
	}
	return total
}

/**
 * Calculate the entry fee for a given amount
 *
 * @param amount The amount to calculate the fee for
 * @param entryFeeType The type of the entry fee
 * @param fee The fee percentage as a decimal 0-1
 * @param totalDepositAmount The total deposit amount
 * @param alreadyPaid The amount already paid
 *
 * @returns The entry fee amount
 */
export function calculateEntryFee(
	amount: number,
	entryFeeType: EntryFeeType,
	fee: number,
	totalDepositAmount: number,
	alreadyPaid: number,
): number {
	switch (entryFeeType) {
		case 'ongoing':
			return amount * fee
		case 'forty-sixty': {
			const stillToBePaid = totalDepositAmount * fee - alreadyPaid
			const currentFee = amount * 0.6
			if (stillToBePaid >= currentFee) return currentFee
			return Math.max(stillToBePaid, 0)
		}
		case 'upfront': {
			const stillToBePaid = totalDepositAmount * fee - alreadyPaid
			if (stillToBePaid >= amount) return amount
			return Math.max(stillToBePaid, 0)
		}
	}
}

export function calculateExitFee(amount: number, exitFeeType: FeeType, fee: number): number {
	switch (exitFeeType) {
		case 'fixed':
			return fee
		case 'percentage':
			return amount * fee
	}
	return 0
}

export function calculateDailyAPY(investment: Investment, numDaysPerYear = NUM_DAYS_PER_YEAR) {
	const investmentAPY = toPercentage(investment.apy ?? 0)
	const apyWithSuccessFee = investment.success_fee
		? investmentAPY - investmentAPY * toPercentage(investment.success_fee)
		: investmentAPY

	const normalizedAPYWithSuccessFee = DECIMAL_1.add(apyWithSuccessFee)
	const dailyAPYWithSuccessFee = normalizedAPYWithSuccessFee.pow(1 / numDaysPerYear)

	const normalizedAPY = DECIMAL_1.add(investmentAPY)
	const dailyAPY = normalizedAPY.pow(1 / numDaysPerYear)

	return { dailyAPY, dailyAPYWithSuccessFee }
}

export function calculateDailyManagementFees(
	investment: Investment,
	numDaysPerYear = NUM_DAYS_PER_YEAR,
) {
	const managementFeeType = stringToFeeType(investment.management_fee_type || DEFAULT_FEE_TYPE)

	return calculateDailyFees(investment.management_fee ?? 0, managementFeeType, numDaysPerYear)
}

export function calculateDailyFees(
	fee: number,
	feeType: FeeType,
	numDaysPerYear = NUM_DAYS_PER_YEAR,
) {
	const value = feeValue(feeType, fee)

	switch (feeType) {
		case 'fixed':
			return {
				dailyFee: new Decimal(value).div(numDaysPerYear),
				dailyFeeMultiplier: DECIMAL_1,
			}
		case 'percentage':
			return {
				dailyFee: DECIMAL_0,
				dailyFeeMultiplier: DECIMAL_1.sub(value).pow(1 / numDaysPerYear),
			}
	}
}
