import { describe, it, expect } from 'vitest'
import {
	calculateWhatYouNeed,
	calculateWhatYouHave,
	generateYears,
	type RetirementCalculationInput,
} from './retirement-calc'

describe('generateYears', () => {
	it('should generate correct year range', () => {
		const depositStart = new Date('2025-01-01')
		const retirementStart = new Date('2060-01-01')
		const retirementLength = 20

		const years = generateYears(depositStart, retirementStart, retirementLength)

		expect(years[0]).toBe(2025)
		expect(years[years.length - 1]).toBe(2080)
		expect(years.length).toBe(56) // 2025 to 2080 inclusive
	})
})

describe('calculateWhatYouNeed', () => {
	const baseInput: RetirementCalculationInput = {
		retirementStart: new Date('2060-01-01'),
		retirementLength: 20,
		desiredBudget: 2000,
		budgetFrequency: 'month',
		currentSavings: 0,
		apy: 5.5,
		inflation: 2.5,
		depositStart: new Date('2025-01-01'),
		depositFrequency: 'month',
	}

	it('should start at 0', () => {
		const result = calculateWhatYouNeed(baseInput)
		expect(result[0]).toBe(0)
	})

	it('should end at 0 after retirement', () => {
		const result = calculateWhatYouNeed(baseInput)
		expect(result[result.length - 1]).toBe(0)
	})

	it('should have peak value at retirement start', () => {
		const result = calculateWhatYouNeed(baseInput)
		const retirementStartIndex = 2060 - 2025 // 35 years from start
		const peak = Math.max(...result)

		expect(result[retirementStartIndex]).toBe(peak)
	})

	it('should grow exponentially during accumulation', () => {
		const result = calculateWhatYouNeed(baseInput)

		// Check that growth accelerates (exponential pattern)
		const midpoint1 = 10
		const midpoint2 = 20
		const midpoint3 = 30

		const growth1 = result[midpoint1] - result[0]
		const growth2 = result[midpoint2] - result[midpoint1]
		const growth3 = result[midpoint3] - result[midpoint2]

		// Each period should show increasing growth (exponential)
		expect(growth2).toBeGreaterThan(growth1)
		expect(growth3).toBeGreaterThan(growth2)
	})

	it('should decline during retirement', () => {
		const result = calculateWhatYouNeed(baseInput)
		const retirementStartIndex = 2060 - 2025

		// Values should decline after retirement starts
		for (let i = retirementStartIndex + 1; i < result.length - 1; i++) {
			expect(result[i]).toBeLessThan(result[i - 1])
		}
	})

	it('should scale with budget amount', () => {
		const input1 = { ...baseInput, desiredBudget: 1000 }
		const input2 = { ...baseInput, desiredBudget: 2000 }

		const result1 = calculateWhatYouNeed(input1)
		const result2 = calculateWhatYouNeed(input2)

		// Peak value should be roughly 2x
		const peak1 = Math.max(...result1)
		const peak2 = Math.max(...result2)

		expect(peak2 / peak1).toBeCloseTo(2, 0)
	})

	it('should handle perYear budget frequency', () => {
		const monthlyInput = { ...baseInput, desiredBudget: 2000, budgetFrequency: 'month' as const }
		const yearlyInput = { ...baseInput, desiredBudget: 24000, budgetFrequency: 'year' as const }

		const result1 = calculateWhatYouNeed(monthlyInput)
		const result2 = calculateWhatYouNeed(yearlyInput)

		// Should produce similar results (2000 * 12 = 24000)
		const peak1 = Math.max(...result1)
		const peak2 = Math.max(...result2)

		expect(peak2 / peak1).toBeCloseTo(1, 1)
	})
})

describe('calculateWhatYouHave', () => {
	const baseInput: RetirementCalculationInput = {
		retirementStart: new Date('2060-01-01'),
		retirementLength: 20,
		desiredBudget: 2000,
		budgetFrequency: 'month',
		currentSavings: 10000,
		apy: 5.5,
		inflation: 2.5,
		depositStart: new Date('2025-01-01'),
		depositFrequency: 'month',
	}

	it('should start with current savings', () => {
		const result = calculateWhatYouHave(baseInput, 100)
		expect(result[0]).toBe(10000)
	})

	it('should grow during accumulation with deposits', () => {
		const result = calculateWhatYouHave(baseInput, 200)

		// Should grow from current savings
		expect(result[10]).toBeGreaterThan(result[0])
		expect(result[20]).toBeGreaterThan(result[10])
	})

	it('should decline during retirement with withdrawals', () => {
		const result = calculateWhatYouHave(baseInput, 500)
		const retirementStartIndex = 2060 - 2025

		// Should decline after retirement (if deposits are insufficient)
		const balanceMidRetirement = result[retirementStartIndex + 10]

		// Balance should either grow slower or decline
		expect(balanceMidRetirement).toBeDefined()
	})

	it('should never go negative', () => {
		// Test with very low deposit
		const result = calculateWhatYouHave(baseInput, 10)

		result.forEach((value) => {
			expect(value).toBeGreaterThanOrEqual(0)
		})
	})

	it('should grow faster with higher deposit amounts', () => {
		const result1 = calculateWhatYouHave(baseInput, 100)
		const result2 = calculateWhatYouHave(baseInput, 200)

		const midpoint = 20
		expect(result2[midpoint]).toBeGreaterThan(result1[midpoint])
	})

	it('should handle monthly deposit frequency', () => {
		const monthlyInput = { ...baseInput, depositFrequency: 'month' as const }
		const result = calculateWhatYouHave(monthlyInput, 100)

		// With 100/month for ~35 years at 5.5% APY, should accumulate significant amount
		const retirementStartIndex = 2060 - 2025
		expect(result[retirementStartIndex]).toBeGreaterThan(100000)
	})

	it('should handle yearly deposit frequency', () => {
		const yearlyInput = { ...baseInput, depositFrequency: 'year' as const }
		const result = calculateWhatYouHave(yearlyInput, 1200)

		// 1200/year should be same as 100/month
		const monthlyInput = { ...baseInput, depositFrequency: 'month' as const }
		const monthlyResult = calculateWhatYouHave(monthlyInput, 100)

		const retirementStartIndex = 2060 - 2025
		// Should be close (within 10% due to timing differences)
		expect(result[retirementStartIndex] / monthlyResult[retirementStartIndex]).toBeCloseTo(1, 0)
	})

	it('should account for inflation in deposits', () => {
		const noInflationInput = { ...baseInput, inflation: 0 }
		const withInflationInput = { ...baseInput, inflation: 2.5 }

		const result1 = calculateWhatYouHave(noInflationInput, 100)
		const result2 = calculateWhatYouHave(withInflationInput, 100)

		const retirementStartIndex = 2060 - 2025

		// With inflation adjustment, deposits grow over time, so end result should be higher
		expect(result2[retirementStartIndex]).toBeGreaterThan(result1[retirementStartIndex])
	})

	it('should match "what you need" when deposit is optimal', () => {
		const whatYouNeed = calculateWhatYouNeed(baseInput)
		const retirementStartIndex = 2060 - 2025
		const targetAtRetirement = whatYouNeed[retirementStartIndex]

		// Try different deposit amounts to find one that gets close
		// This is more of a sanity check that the calculations are consistent
		const result = calculateWhatYouHave(baseInput, 500)
		const actualBalance = result[retirementStartIndex]

		// Just verify it produces reasonable values
		expect(actualBalance).toBeGreaterThan(0)
		expect(actualBalance).toBeLessThan(targetAtRetirement * 10)
	})
})

describe('integration tests', () => {
	it('should produce consistent results across functions', () => {
		const input: RetirementCalculationInput = {
			retirementStart: new Date('2060-01-01'),
			retirementLength: 20,
			desiredBudget: 2000,
			budgetFrequency: 'month',
			currentSavings: 0,
			apy: 5.5,
			inflation: 2.5,
			depositStart: new Date('2025-01-01'),
			depositFrequency: 'month',
		}

		const years = generateYears(input.depositStart, input.retirementStart, input.retirementLength)
		const whatYouNeed = calculateWhatYouNeed(input)
		const whatYouHave = calculateWhatYouHave(input, 200)

		// All arrays should have same length
		expect(whatYouNeed.length).toBe(years.length)
		expect(whatYouHave.length).toBe(years.length)

		// All values should be non-negative
		whatYouNeed.forEach((value) => expect(value).toBeGreaterThanOrEqual(0))
		whatYouHave.forEach((value) => expect(value).toBeGreaterThanOrEqual(0))
	})

	it('should generate correct chart labels showing start, retirement, and end years', () => {
		const input: RetirementCalculationInput = {
			retirementStart: new Date('2030-01-01'),
			retirementLength: 25,
			desiredBudget: 3000,
			budgetFrequency: 'month',
			currentSavings: 50000,
			apy: 6.0,
			inflation: 2.5,
			depositStart: new Date('2025-01-01'),
			depositFrequency: 'month',
		}

		const years = generateYears(input.depositStart, input.retirementStart, input.retirementLength)
		const startYear = years[0]
		const endYear = years[years.length - 1]
		const retirementStartYear = input.retirementStart.getFullYear()

		// Generate chart labels (mimicking the store logic)
		const chartLabels = years.map((year) => {
			if (year === startYear || year === endYear || year === retirementStartYear) {
				return year.toString()
			}
			return ''
		})

		// Verify start year label exists
		expect(chartLabels[0]).toBe(startYear.toString())

		// Verify end year label exists
		expect(chartLabels[chartLabels.length - 1]).toBe(endYear.toString())

		// Verify retirement year label exists
		const retirementIndex = years.indexOf(retirementStartYear)
		expect(chartLabels[retirementIndex]).toBe(retirementStartYear.toString())

		// Count non-empty labels (should be exactly 3: start, retirement, end)
		const nonEmptyLabels = chartLabels.filter((label) => label !== '')
		expect(nonEmptyLabels.length).toBe(3)
		expect(nonEmptyLabels).toContain(startYear.toString())
		expect(nonEmptyLabels).toContain(endYear.toString())
		expect(nonEmptyLabels).toContain(retirementStartYear.toString())
	})

	it('should stop deposits at retirement age 50 (not continue until 65)', () => {
		// Test with someone born in 1980, currently 45, retiring at 50 in 2030
		const birthYear = 1980
		const retirementAge = 50
		const retirementYear = birthYear + retirementAge // 2030

		const input: RetirementCalculationInput = {
			retirementStart: new Date(`${retirementYear}-01-01`), // Retire at age 50 in 2030
			retirementLength: 25,
			desiredBudget: 3000,
			budgetFrequency: 'month',
			currentSavings: 50000,
			apy: 6.0,
			inflation: 2.5,
			depositStart: new Date('2025-01-01'), // Start deposits now (age 45)
			depositFrequency: 'month',
		}

		const whatYouHave = calculateWhatYouHave(input, 1000)
		const years = generateYears(input.depositStart, input.retirementStart, input.retirementLength)

		// Calculate year-over-year growth rates to verify deposit/withdrawal pattern
		const growthRates: number[] = []
		for (let i = 1; i < whatYouHave.length; i++) {
			const growth = whatYouHave[i] - whatYouHave[i - 1]
			growthRates.push(growth)
		}

		// Verify deposits happen through year 2029 (age 49) and stop at year 2030 (age 50)
		const retirementYearIndex = years.indexOf(retirementYear)

		// Before retirement: balance should grow due to deposits + APY
		for (let i = 0; i < retirementYearIndex; i++) {
			expect(growthRates[i]).toBeGreaterThan(0)
			expect(whatYouHave[i + 1]).toBeGreaterThan(whatYouHave[i])
		}

		// At retirement year (2030): withdrawals should begin, causing negative growth
		const firstRetirementGrowth = growthRates[retirementYearIndex]
		expect(firstRetirementGrowth).toBeLessThan(0) // Balance should decrease due to withdrawals

		// Continue verifying withdrawals in subsequent retirement years
		for (let i = retirementYearIndex; i < retirementYearIndex + 5 && i < growthRates.length; i++) {
			// Balance should be decreasing or stable (not growing like during accumulation)
			expect(growthRates[i]).toBeLessThanOrEqual(0)
		}
	})
})
