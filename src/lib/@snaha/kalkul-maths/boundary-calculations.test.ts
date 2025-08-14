import { describe, expect, it } from 'vitest'
import { getInvestmentValues } from './investment-calculations'
import type { Investment } from '$lib/types'

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

describe('Year boundary investment value calculation bug', () => {
	it('should fix the year boundary issue - values should be recorded at calendar year ends', () => {
		// The user's exact scenario: portfolio 2024-09-13 → 2049-09-13, deposit 2025-05-14
		// After fix: 2025 should show the deposit value, not 0

		const depositValue = 100000
		const deposits = new Map<string, number>([['2025-05-14', depositValue]])
		const withdrawals = new Map<string, number>([])
		const investment = DEFAULT_INVESTMENT
		const startDate = new Date('2024-09-13')
		const endDate = new Date('2049-09-13')

		const yearlyPeriod = { count: 1, period: 'year' as const }
		const { investmentValues } = getInvestmentValues(
			yearlyPeriod,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		// After the fix, values should now be recorded at calendar year-ends:
		// - Index 0: value as of 2024-12-31 (0 - no deposits yet)
		// - Index 1: value as of 2025-12-31 (100k - deposit from 2025-05-14)
		// - Index 2: value as of 2026-12-31 (100k - no change)

		expect(investmentValues[0]).toEqual(0) // 2024-12-31: no deposits yet
		expect(investmentValues[1]).toEqual(depositValue) // 2025-12-31: deposit from 2025-05-14
		expect(investmentValues[2]).toEqual(depositValue) // 2026-12-31: still 100k
	})

	it('should calculate values correctly for year-end dates', () => {
		// Test with a deposit that should be included in the same year
		const periodCount = { count: 1, period: 'year' as const }
		const depositValue = 50000
		const deposits = new Map<string, number>([['2025-12-31', depositValue]]) // End of year deposit
		const withdrawals = new Map<string, number>([])
		const investment = DEFAULT_INVESTMENT
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2026-12-31')

		const { investmentValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		// A deposit on 2025-12-31 should be counted in 2025's value, not 2026's
		expect(investmentValues[1]).toEqual(depositValue) // Should be 50000 for year 2025
		expect(investmentValues[2]).toEqual(depositValue) // Should remain 50000 for year 2026
	})

	it('should handle deposits made in the middle of investment period correctly with growth', () => {
		// Test the exact scenario with APY to verify growth calculations
		const periodCount = { count: 1, period: 'year' as const }
		const depositValue = 100000
		const deposits = new Map<string, number>([['2025-05-14', depositValue]])
		const withdrawals = new Map<string, number>([])
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 5, // 5% APY to see growth
		}
		const startDate = new Date('2024-09-13')
		const endDate = new Date('2049-09-13')

		const { investmentValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		// After fix, values are recorded at calendar year-ends:
		// Index 0: 2024-12-31 - should be 0 (no deposits yet)
		expect(investmentValues[0]).toEqual(0)

		// Index 1: 2025-12-31 - should have deposit + growth from May 14 to Dec 31
		// That's about 7.5 months of growth on 100k at 5% APY
		expect(investmentValues[1]).toBeGreaterThan(100000) // Should be > 100000 due to growth

		// Index 2: 2026-12-31 - should have full year of additional growth
		expect(investmentValues[2]).toBeGreaterThan(investmentValues[1])
	})
})

describe('Monthly boundary investment value calculation', () => {
	it('should record monthly values at end of each calendar month', () => {
		// Test monthly periods: portfolio from 2025-01-15 to 2025-04-30, deposit on 2025-02-14
		const periodCount = { count: 1, period: 'month' as const }
		const depositValue = 50000
		const deposits = new Map<string, number>([['2025-02-14', depositValue]])
		const withdrawals = new Map<string, number>([])
		const investment = DEFAULT_INVESTMENT
		const startDate = new Date('2025-01-15')
		const endDate = new Date('2025-04-30')

		const { investmentValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		// After fix, values should be recorded at calendar month-ends:
		// Index 0: value as of 2025-01-31 (0 - no deposits yet)
		// Index 1: value as of 2025-02-28 (50k - deposit from 2025-02-14)
		// Index 2: value as of 2025-03-31 (50k - no change)
		// Index 3: value as of 2025-04-30 (50k - no change)

		expect(investmentValues[0]).toEqual(0) // 2025-01-31: no deposits yet
		expect(investmentValues[1]).toEqual(depositValue) // 2025-02-28: deposit from 2025-02-14
		expect(investmentValues[2]).toEqual(depositValue) // 2025-03-31: still 50k
		expect(investmentValues[3]).toEqual(depositValue) // 2025-04-30: still 50k
	})

	it('should handle monthly deposits correctly across different months', () => {
		// Test multiple deposits in different months
		const periodCount = { count: 1, period: 'month' as const }
		const deposits = new Map<string, number>([
			['2025-01-20', 30000],
			['2025-03-10', 20000],
		])
		const withdrawals = new Map<string, number>([])
		const investment = DEFAULT_INVESTMENT
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-04-30')

		const { investmentValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		// Values recorded at end of each calendar month:
		// Index 0: 2025-01-31 (30k from Jan deposit)
		// Index 1: 2025-02-29 (30k - no activity in Feb)
		// Index 2: 2025-03-31 (50k - Mar deposit added)
		// Index 3: 2025-04-30 (50k - no activity in Apr)

		expect(investmentValues[0]).toEqual(30000) // Jan deposit
		expect(investmentValues[1]).toEqual(30000) // No change in Feb
		expect(investmentValues[2]).toEqual(50000) // Mar deposit added
		expect(investmentValues[3]).toEqual(50000) // No change in Apr
	})

	it('should handle monthly periods with growth correctly', () => {
		// Test monthly with APY to verify growth calculations
		const periodCount = { count: 1, period: 'month' as const }
		const depositValue = 60000
		const deposits = new Map<string, number>([['2025-02-15', depositValue]])
		const withdrawals = new Map<string, number>([])
		const investment = {
			...DEFAULT_INVESTMENT,
			apy: 12, // 12% APY (1% per month) for easier calculations
		}
		const startDate = new Date('2025-01-01')
		const endDate = new Date('2025-05-31')

		const { investmentValues } = getInvestmentValues(
			periodCount,
			{ deposits, withdrawals, startDate, endDate },
			investment,
			NUM_DAYS_PER_YEAR,
		)

		// Values with growth:
		// Index 0: 2025-01-31 (0 - no deposits yet)
		// Index 1: 2025-02-28 (60k + ~2 weeks growth)
		// Index 2: 2025-03-31 (previous + 1 month growth)
		// Index 3: 2025-04-30 (previous + 1 month growth)
		// Index 4: 2025-05-31 (previous + 1 month growth)

		expect(investmentValues[0]).toEqual(0) // No deposits yet
		expect(investmentValues[1]).toBeGreaterThan(depositValue) // Deposit + ~2 weeks growth
		expect(investmentValues[2]).toBeGreaterThan(investmentValues[1]) // Additional month growth
		expect(investmentValues[3]).toBeGreaterThan(investmentValues[2]) // Additional month growth
		expect(investmentValues[4]).toBeGreaterThan(investmentValues[3]) // Additional month growth
	})
})
