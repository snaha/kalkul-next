import { describe, expect, it } from 'vitest'
import {
	calculateDailyFees,
	calculateDailyManagementFees,
	calculateEntryFee,
	calculateExitFee,
	calculateTotalDepositAmount,
	getInvestmentValues,
} from './calc'
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

		expect(investmentValues[NUM_DAYS_PER_YEAR]).toBeCloseTo(89)
		expect(feeValues[NUM_DAYS_PER_YEAR - 1].exitFee).toBeCloseTo(11)
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
