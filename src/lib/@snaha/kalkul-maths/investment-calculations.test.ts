import { describe, expect, it } from 'vitest'
import {
	getInvestmentValues,
	getCurrentInvestmentValue,
	getCurrentPortfolioValue,
} from './investment-calculations'
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
		const periodCount = { count: 1, period: 'month' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-15', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment = DEFAULT_INVESTMENT
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, feeValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		// Monthly periods: should have one entry per month
		expect(feeValues.length).toBeGreaterThan(0)
		expect(investmentValues.length).toEqual(feeValues.length)

		// The deposit made on Jan 15 should appear in the January value (index 0)
		expect(investmentValues[0]).toEqual(initialDepositValue)
	})

	it('should calculate simple investment without fees', () => {
		const periodCount = { count: 1, period: 'year' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		// With 10% APY for a full year, 100 should become 110
		expect(investmentValues[0]).toBeCloseTo(110, 1)
	})

	it('should calculate simple investment with upfront entry fee', () => {
		const periodCount = { count: 1, period: 'year' as const }
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
		const endDate = new Date('2025-12-31')
		const { investmentValues, feeValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		// 100 deposit - 10 entry fee = 90 invested, with 10% growth = 99
		expect(investmentValues[0]).toBeCloseTo(99, 1)
		expect(feeValues[0].entryFee).toEqual(10)
	})

	it('should calculate simple investment with fixed exit fee', () => {
		const periodCount = { count: 1, period: 'year' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([['2025-12-31', 10]])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			exit_fee_type: 'fixed',
			exit_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, feeValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		// 100 grows to 110, then 10 withdrawn + 10 exit fee = 90 remaining
		expect(investmentValues[0]).toBeCloseTo(90, 1)
		expect(feeValues[0].exitFee).toEqual(10)
	})

	it('should calculate simple investment with percentage exit fee', () => {
		const periodCount = { count: 1, period: 'year' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([['2025-12-31', 10]])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			exit_fee_type: 'percentage',
			exit_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, feeValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		// 100 grows to 110, then 10 withdrawn + 1 exit fee (10% of 10) = 99 remaining
		expect(investmentValues[0]).toBeCloseTo(99, 1)
		expect(feeValues[0].exitFee).toEqual(1)
	})

	it('should calculate simple investment with TER fee', () => {
		const periodCount = { count: 1, period: 'year' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			ter: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, feeValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		expect(investmentValues[0]).toBeCloseTo(99, 1)
		expect(feeValues[0].TERFee).toBeGreaterThan(0)
	})

	it('should calculate simple investment with percentage management fee', () => {
		const periodCount = { count: 1, period: 'year' as const }
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
		const endDate = new Date('2025-12-31')
		const { investmentValues, feeValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		expect(investmentValues[0]).toBeCloseTo(99, 1)
		expect(feeValues[0].managementFee).toBeGreaterThan(0)
	})

	it('should calculate simple investment with fixed management fee', () => {
		const periodCount = { count: 1, period: 'year' as const }
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
		const endDate = new Date('2025-12-31')
		const { investmentValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		expect(investmentValues[0]).toBeCloseTo(99.479)
	})

	it('should calculate simple investment with success fee', () => {
		const periodCount = { count: 1, period: 'year' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 10,
			success_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, feeValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBe(0)
		expect(investmentValues[0]).toBeCloseTo(109, 1)
		expect(feeValues[0].successFee).toBeGreaterThan(0)
	})

	it('should report managementFee error when daily management fee exceeds investment value', () => {
		const periodCount = { count: 1, period: 'year' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 0,
			management_fee_type: 'fixed',
			management_fee: 120, // Daily management fee will be 120/365 ≈ 0.328 per day
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBeGreaterThan(0)
		expect(errors.some((error) => error.type === 'managementFee')).toBe(true)
		// Investment value should not go negative
		expect(Math.min(...investmentValues)).toBeGreaterThanOrEqual(0)
	})

	it('should report withdrawal error when withdrawal exceeds available investment value', () => {
		const periodCount = { count: 1, period: 'year' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([['2025-06-01', 150]]) // Withdraw more than available
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 0, // No growth to ensure withdrawal exceeds value
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, withdrawalValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBeGreaterThan(0)
		expect(errors.some((error) => error.type === 'withdrawal')).toBe(true)
		// Investment value should not go negative
		expect(Math.min(...investmentValues)).toBeGreaterThanOrEqual(0)
		// Actual withdrawal should be limited to available amount
		expect(Math.abs(withdrawalValues[0])).toBeLessThan(150)
	})

	it('should report withdrawal error with exit fees when total needed exceeds value', () => {
		const periodCount = { count: 1, period: 'year' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([['2025-06-01', 95]]) // Withdraw + exit fee = 95 + 10 = 105 > 100
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 0,
			exit_fee_type: 'fixed',
			exit_fee: 10,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBeGreaterThan(0)
		expect(errors.some((error) => error.type === 'withdrawal')).toBe(true)
		// Investment value should not go negative
		expect(Math.min(...investmentValues)).toBeGreaterThanOrEqual(0)
	})

	it('should report both managementFee and withdrawal errors in extreme scenario', () => {
		const periodCount = { count: 1, period: 'month' as const }
		const initialDepositValue = 50
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([['2025-02-01', 60]]) // Withdraw more than deposited
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: -5, // Negative return
			management_fee_type: 'fixed',
			management_fee: 20, // High daily management fee
			exit_fee_type: 'fixed',
			exit_fee: 5,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-03-31')
		const { investmentValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBeGreaterThan(0)
		const errorTypes = errors.map((error) => error.type)
		// Should report both types of errors
		expect(errorTypes.includes('managementFee')).toBe(true)
		expect(errorTypes.includes('withdrawal')).toBe(true)
		// Investment value should never go negative
		expect(Math.min(...investmentValues)).toBeGreaterThanOrEqual(0)
	})

	it('should limit daily management fee to available value when value is insufficient', () => {
		const periodCount = { count: 1, period: 'month' as const }
		const initialDepositValue = 10
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 0,
			management_fee_type: 'fixed',
			management_fee: 20, // Daily fee ≈ 0.055, but small initial value means it will hit zero quickly
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-12-31')
		const { investmentValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBeGreaterThan(0)
		expect(errors.some((error) => error.type === 'managementFee')).toBe(true)
		// With high management fees, the value should drop to zero but not negative
		expect(investmentValues[investmentValues.length - 1]).toEqual(0)
	})

	it('should limit actual withdrawal to available value when insufficient funds', () => {
		const periodCount = { count: 1, period: 'month' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([['2025-01-15', 200]]) // Try to withdraw double
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 0,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-02-28')
		const { investmentValues, withdrawalValues, errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toBeGreaterThan(0)
		expect(errors.some((error) => error.type === 'withdrawal')).toBe(true)
		// Investment value should become 0, not negative
		expect(investmentValues[0]).toEqual(0) // January value after withdrawal
		// Actual withdrawal should be limited to the available 100
		expect(Math.abs(withdrawalValues[0])).toEqual(100)
	})

	it('should report errors with correct dates', () => {
		const periodCount = { count: 1, period: 'month' as const }
		const initialDepositValue = 100
		const deposits = new Map<string, number>([['2025-01-01', initialDepositValue]])
		const withdrawals = new Map<string, number>([
			['2025-02-15', 150], // First problematic withdrawal
			['2025-03-20', 50], // Second problematic withdrawal
		])
		const investment: Investment = {
			...DEFAULT_INVESTMENT,
			apy: 0,
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-04-30')
		const { errors } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		expect(errors.length).toEqual(2)

		// Check that error dates match the problematic transaction dates
		const errorDates = errors.map((error) => error.date.toISOString().split('T')[0])
		expect(errorDates).toContain('2025-02-15')
		expect(errorDates).toContain('2025-03-20')

		// All errors should be withdrawal type in this scenario
		expect(errors.every((error) => error.type === 'withdrawal')).toBe(true)
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
