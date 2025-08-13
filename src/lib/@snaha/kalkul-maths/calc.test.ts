import { describe, expect, it } from 'vitest'
import {
	calculateDailyFees,
	calculateDailyManagementFees,
	calculateEntryFee,
	calculateExitFee,
	calculateTotalDepositAmount,
	getInvestmentValues,
	getCurrentInvestmentValue,
	getCurrentPortfolioValue,
} from './calc'
import type { Investment } from '$lib/types'
import type { Transaction } from './types'

const DEFAULT_INVESTMENT: Investment = {
	apy: 0,
	entry_fee: 0,
	entry_fee_type: 'upfront' as const,
	exit_fee: 0,
	exit_fee_type: 'upfront' as const,
	id: 0,
	advanced_fees: false,
	created_at: '2024-01-01',
	last_edited_at: '2024-01-01',
	management_fee: 0,
	management_fee_type: 'upfront' as const,
	name: '',
	portfolio_id: 0,
	success_fee: 0,
	ter: null,
	type: '',
}
const NUM_DAYS_PER_YEAR = 365

describe('#getInvestmentValues', () => {
	it('should calculate default investment', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment = DEFAULT_INVESTMENT
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues, feeValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		// the end date is inclusive, hence the + 1
		expect(feeValues.length).toEqual(NUM_DAYS_PER_YEAR + 1)
		// for the line graph there is an extra datapoint
		expect(investmentValues.length).toEqual(NUM_DAYS_PER_YEAR + 2)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toEqual(initialDepositValue)
	})

	it('should calculate simple investment without fees', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toEqual(110)
	})

	it('should calculate simple investment with upfront entry fee', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			entry_fee_type: 'upfront',
			entry_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues, feeValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toEqual(99)
		expect(feeValues[0].entryFee).toEqual(10)
	})

	it('should calculate simple investment with fixed exit fee', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([['2026-01-01', 10]])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			exit_fee_type: 'fixed',
			exit_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues, feeValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toEqual(90)
		expect(feeValues[NUM_DAYS_PER_YEAR - 1].exitFee).toEqual(10)
	})

	it('should calculate simple investment with percentage exit fee', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([['2026-01-01', 10]])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			exit_fee_type: 'percentage',
			exit_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues, feeValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toEqual(99)
		expect(feeValues[NUM_DAYS_PER_YEAR - 1].exitFee).toEqual(1)
	})

	it('should calculate simple investment with TER fee', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			ter: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues, feeValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toEqual(99)
		expect(feeValues[NUM_DAYS_PER_YEAR - 1].TERFee).toEqual(0.028581360688047303)
	})

	it('should calculate simple investment with percentage management fee', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			management_fee_type: 'percentage',
			management_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues, feeValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toEqual(99)
		expect(feeValues[NUM_DAYS_PER_YEAR - 1].managementFee).toEqual(0.028581360688047303)
	})

	it('should calculate simple investment with fixed management fee', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			management_fee_type: 'fixed',
			management_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toBeCloseTo(99.479)
	})

	it('should calculate simple investment with success fee', () => {
		const periodCount = { count: 1, period: 'day' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			success_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-01-01')
		const { investmentValues, feeValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toEqual(109)
		expect(feeValues[NUM_DAYS_PER_YEAR - 1].successFee).toEqual(0.002727268936203124)
	})
})

describe('#calculateTotalDepositAmount', () => {
	it('should return 0 for an empty deposit map', () => {
		const deposits = new Map<string, number>()
		expect(calculateTotalDepositAmount(deposits)).toBe(0)
	})

	it('should correctly sum a single deposit', () => {
		const deposits = new Map<string, number>([['2024-01-01', 150]])
		expect(calculateTotalDepositAmount(deposits)).toBe(150)
	})

	it('should correctly sum multiple deposits', () => {
		const deposits = new Map<string, number>([
			['2024-01-01', 100],
			['2024-01-15', 250],
			['2024-02-01', 300],
		])
		expect(calculateTotalDepositAmount(deposits)).toBe(650)
	})
})

describe('#calculateEntryFee', () => {
	it('should calculate ongoing fee as amount * fee', () => {
		expect(calculateEntryFee(1000, 'ongoing', 0.05, 0, 0)).toBe(50)
		expect(calculateEntryFee(1000, 'ongoing', 0.05, 10000, 100)).toBe(50)
		expect(calculateEntryFee(200, 'ongoing', 0.1, 0, 0)).toBe(20)
	})

	it('should calculate forty-sixty fee when still to be paid >= current fee', () => {
		expect(calculateEntryFee(1000, 'forty-sixty', 0.01, 100000, 0)).toBe(600)
	})
	it('should have 0 fees when all fees are already paid', () => {
		expect(calculateEntryFee(1000, 'forty-sixty', 0.01, 100000, 10000)).toBe(0)
	})

	it('should cap forty-sixty fee when still to be paid < current fee', () => {
		expect(calculateEntryFee(1000, 'forty-sixty', 0.01, 100000, 950)).toBe(50)
	})

	it('should pay full amount as fee with upfront', () => {
		expect(calculateEntryFee(1000, 'upfront', 0.1, 100000, 0)).toBe(1000)
	})

	it('should have 0 fees when all fees are already paid', () => {
		expect(calculateEntryFee(1000, 'upfront', 0.01, 100000, 1000)).toBe(0)
	})

	it('should cap upfront fee when only part of the total fees is remaining', () => {
		expect(calculateEntryFee(1000, 'upfront', 0.01, 10000, 90)).toBe(10)
	})
})

describe('#calculateExitFee', () => {
	it('should calculate percentage', () => {
		expect(calculateExitFee(1000, 'percentage', 0.05)).toBe(50)
	})

	it('should calculate fixed', () => {
		expect(calculateExitFee(1000, 'fixed', 50)).toBe(50)
	})
})

describe('#calculateDailyManagementFees', () => {
	it('should calculate fixed daily fee', () => {
		const managementFee = 0.1
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			management_fee_type: 'fixed',
			management_fee: managementFee,
		}

		const { dailyFee: dailyManagementFee, dailyFeeMultiplier } = calculateDailyManagementFees(
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(dailyFeeMultiplier.toNumber()).toEqual(1)
		expect(dailyManagementFee.mul(NUM_DAYS_PER_YEAR).toNumber()).toEqual(managementFee)
	})

	it('should calculate percentage daily fee', () => {
		const managementFee = 10
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			management_fee_type: 'percentage',
			management_fee: managementFee,
		}

		const { dailyFee: dailyManagementFee, dailyFeeMultiplier } = calculateDailyManagementFees(
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(dailyManagementFee.toNumber()).toEqual(0)
		expect(dailyFeeMultiplier.toNumber()).toEqual(0.9997113827109777)
	})
})

describe('#calculateDailyFees', () => {
	it('should calculate percentage daily fee', () => {
		const terFee = 10
		const { dailyFee: dailyManagementFee, dailyFeeMultiplier } = calculateDailyFees(
			terFee,
			'percentage',
			NUM_DAYS_PER_YEAR,
		)

		expect(dailyManagementFee.toNumber()).toEqual(0)
		expect(dailyFeeMultiplier.toNumber()).toEqual(0.9997113827109777)
	})
})

describe('#getCurrentInvestmentValue', () => {
	it('should return 0 for investment with no transactions', () => {
		const baseData = {
			deposits: new Map<string, number>(),
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = DEFAULT_INVESTMENT

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-06-15'))

		expect(value).toEqual(0)
	})

	it('should return 0 when as-of date is before investment start date', () => {
		const deposits = new Map<string, number>([['2025-01-15', 1000]])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-15'),
			endDate: new Date('2025-12-31'),
		}
		const investment = { ...DEFAULT_INVESTMENT, apy: 10 }

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-01-01'))

		expect(value).toEqual(0)
	})

	it('should calculate simple investment value on exact start date', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = { ...DEFAULT_INVESTMENT, apy: 0 }

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-01-01'))

		expect(value).toEqual(1000)
	})

	it('should calculate investment value with 10% APY after one year', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = { ...DEFAULT_INVESTMENT, apy: 10 }

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2026-01-01'))

		expect(Math.round(value)).toEqual(1100) // 10% growth
	})

	it('should handle multiple deposits over time', () => {
		const deposits = new Map<string, number>([
			['2025-01-01', 1000],
			['2025-03-01', 500],
			['2025-06-01', 300],
		])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = { ...DEFAULT_INVESTMENT, apy: 12 }

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-12-31'))

		// Total deposits 1800, should grow with compound interest
		expect(value).toBeCloseTo(1989.7, 1)
	})

	it('should handle withdrawals correctly', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const withdrawals = new Map<string, number>([['2025-06-01', 200]])
		const baseData = {
			deposits,
			withdrawals,
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = { ...DEFAULT_INVESTMENT, apy: 10 }

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-12-31'))

		// Started with 1000, withdrew 200, should have growth minus withdrawal impact
		expect(value).toBeCloseTo(888.2, 1)
	})

	it('should apply entry fees correctly', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 0,
			entry_fee: 5, // 5% entry fee
			entry_fee_type: 'ongoing' as const,
		}

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-01-01'))

		expect(value).toEqual(950) // 1000 - 5% = 950
	})

	it('should apply exit fees correctly', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const withdrawals = new Map<string, number>([['2025-06-01', 200]])
		const baseData = {
			deposits,
			withdrawals,
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 0,
			exit_fee: 2, // 2% exit fee
			exit_fee_type: 'percentage' as const,
		}

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-06-01'))

		// 1000 deposit - 200 withdrawal - 4 exit fee (2% of 200) = 796
		expect(value).toEqual(796)
	})

	it('should apply management fees correctly', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			management_fee: 2, // 2% management fee
			management_fee_type: 'percentage' as const,
		}

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2026-01-01'))

		// 10% APY reduced by management fees
		expect(value).toBeCloseTo(1077.9, 1)
	})

	it('should apply success fees correctly', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			success_fee: 20, // 20% success fee
		}

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2026-01-01'))

		// 10% APY with 20% success fee on gains
		expect(value).toBeCloseTo(1079.9, 1)
	})

	it('should apply TER fees correctly', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			ter: 1.5, // 1.5% TER fee
		}

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2026-01-01'))

		// 10% APY reduced by 1.5% TER fee
		expect(value).toBeCloseTo(1083.4, 1)
	})

	it('should continue calculation beyond end date when as-of date is beyond', () => {
		const deposits = new Map<string, number>([['2025-01-01', 1000]])
		const baseData = {
			deposits,
			withdrawals: new Map<string, number>(),
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-06-30'), // Investment ends mid-year
		}
		const investment = { ...DEFAULT_INVESTMENT, apy: 10 }

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-12-31'))

		// Should calculate growth for full year (~10% growth) despite end date
		expect(Math.round(value)).toEqual(1100)
	})

	it('should handle complex scenario with all fee types', () => {
		const deposits = new Map<string, number>([
			['2025-01-01', 1000],
			['2025-03-01', 500],
		])
		const withdrawals = new Map<string, number>([['2025-09-01', 300]])
		const baseData = {
			deposits,
			withdrawals,
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		}
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 12,
			entry_fee: 2,
			entry_fee_type: 'ongoing' as const,
			exit_fee: 1,
			exit_fee_type: 'percentage' as const,
			management_fee: 1,
			management_fee_type: 'percentage' as const,
			success_fee: 15,
			ter: 0.8,
		}

		const value = getCurrentInvestmentValue(baseData, investment, new Date('2025-12-31'))

		// Complex scenario with multiple fees applied
		expect(value).toBeCloseTo(1272.7, 1)
	})
})

describe('#getCurrentPortfolioValue', () => {
	// Mock transaction store
	const createMockTransactionStore = (transactionMap: Map<number, Transaction[]>) => ({
		filter: (investmentId: number) => transactionMap.get(investmentId) || [],
	})

	it('should return 0 for empty portfolio', () => {
		const transactionStore = createMockTransactionStore(new Map())
		const investments: Investment[] = []

		const value = getCurrentPortfolioValue(transactionStore, investments)

		expect(value).toEqual(0)
	})

	it('should return 0 for portfolio with investments but no transactions', () => {
		const transactionStore = createMockTransactionStore(new Map())
		const investments = [DEFAULT_INVESTMENT]

		const value = getCurrentPortfolioValue(transactionStore, investments)

		expect(value).toEqual(0)
	})

	it('should calculate single investment portfolio value', () => {
		const transactions: Transaction[] = [
			{
				type: 'deposit',
				amount: 1000,
				date: '2025-01-01',
				end_date: '2025-12-31',
				repeat: null,
				repeat_unit: null,
			},
		]
		const transactionStore = createMockTransactionStore(new Map([[1, transactions]]))
		const investments = [{ ...DEFAULT_INVESTMENT, id: 1, apy: 10 }]

		// Calculate value after 6 months
		const asOfDate = new Date('2025-07-01')
		const value = getCurrentPortfolioValue(transactionStore, investments, asOfDate)

		expect(value).toBeCloseTo(1048.4, 1) // 6 months of growth
	})

	it('should sum multiple investments correctly', () => {
		const transactions1: Transaction[] = [
			{
				type: 'deposit',
				amount: 1000,
				date: '2025-01-01',
				end_date: '2026-12-31',
				repeat: null,
				repeat_unit: null,
			},
		]
		const transactions2: Transaction[] = [
			{
				type: 'deposit',
				amount: 2000,
				date: '2025-01-01',
				end_date: '2026-12-31',
				repeat: null,
				repeat_unit: null,
			},
		]
		const transactionStore = createMockTransactionStore(
			new Map([
				[1, transactions1],
				[2, transactions2],
			]),
		)
		const investments = [
			{ ...DEFAULT_INVESTMENT, id: 1, apy: 8 },
			{ ...DEFAULT_INVESTMENT, id: 2, apy: 12 },
		]

		const asOfDate = new Date('2026-01-01') // 1 year later
		const value = getCurrentPortfolioValue(transactionStore, investments, asOfDate)

		// Sum of two investments with different APY rates
		expect(value).toBeCloseTo(3319.8, 1)
	})

	it('should handle mixed scenarios with different investment performance', () => {
		const transactions1: Transaction[] = [
			{
				type: 'deposit',
				amount: 1000,
				date: '2025-01-01',
				end_date: '2025-12-31',
				repeat: null,
				repeat_unit: null,
			},
		]
		const transactions2: Transaction[] = [
			{
				type: 'deposit',
				amount: 1000,
				date: '2025-01-01',
				end_date: '2025-12-31',
				repeat: null,
				repeat_unit: null,
			},
			{
				type: 'withdrawal',
				amount: 200,
				date: '2025-06-01',
				end_date: '2025-12-31',
				repeat: null,
				repeat_unit: null,
			},
		]
		const transactionStore = createMockTransactionStore(
			new Map([
				[1, transactions1],
				[2, transactions2],
			]),
		)
		const investments = [
			{ ...DEFAULT_INVESTMENT, id: 1, apy: 0 }, // No growth
			{ ...DEFAULT_INVESTMENT, id: 2, apy: 10 }, // 10% growth
		]

		const asOfDate = new Date('2025-12-31')
		const value = getCurrentPortfolioValue(transactionStore, investments, asOfDate)

		// Investment 1 has no growth, Investment 2 has growth but with withdrawal
		expect(value).toBeCloseTo(1888.2, 1)
	})

	it('should skip investments with no transactions', () => {
		const transactions1: Transaction[] = [
			{
				type: 'deposit',
				amount: 1000,
				date: '2025-01-01',
				end_date: '2026-12-31',
				repeat: null,
				repeat_unit: null,
			},
		]
		const transactionStore = createMockTransactionStore(
			new Map([
				[1, transactions1],
				// Investment 2 has no transactions
			]),
		)
		const investments = [
			{ ...DEFAULT_INVESTMENT, id: 1, apy: 10 },
			{ ...DEFAULT_INVESTMENT, id: 2, apy: 15 }, // This should be ignored
		]

		const asOfDate = new Date('2026-01-01')
		const value = getCurrentPortfolioValue(transactionStore, investments, asOfDate)

		// Only investment 1 should contribute: ~1100
		expect(Math.round(value)).toEqual(1100)
	})

	it('should use today as default date', () => {
		const transactions: Transaction[] = [
			{
				type: 'deposit',
				amount: 1000,
				date: '2025-01-01',
				end_date: '2026-12-31',
				repeat: null,
				repeat_unit: null,
			},
		]
		const transactionStore = createMockTransactionStore(new Map([[1, transactions]]))
		const investments = [{ ...DEFAULT_INVESTMENT, id: 1, apy: 0 }]

		// Should not throw and should return a reasonable value
		const value = getCurrentPortfolioValue(transactionStore, investments)

		expect(typeof value).toBe('number')
		expect(value).toBeGreaterThanOrEqual(0)
	})
})
