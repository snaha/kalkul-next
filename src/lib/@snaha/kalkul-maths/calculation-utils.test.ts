import { describe, expect, it } from 'vitest'
import { calculateTotalDepositAmount } from './calculation-utils'

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
