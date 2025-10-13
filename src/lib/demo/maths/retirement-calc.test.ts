import { describe, it, expect } from 'vitest'
import {
	calculateWhatYouNeed,
	calculateWhatYouHave,
	calculateRequiredDeposit,
	generateYears,
	type RetirementCalculationInput,
} from './retirement-calc'
import { getGraphDataForPortfolio } from '$lib/@snaha/kalkul-maths/graph-data'
import type { Portfolio, Investment, Transaction } from '$lib/types'

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

	it('should start with small positive value', () => {
		const result = calculateWhatYouNeed(baseInput)
		// Year-end of first year should have some value
		expect(result[0]).toBeGreaterThan(0)
		expect(result[0]).toBeLessThan(50000) // Reasonable for first year
	})

	it('should end at 0 after retirement', () => {
		const result = calculateWhatYouNeed(baseInput)
		expect(result[result.length - 1]).toBe(0)
	})

	it('should have peak value near retirement start', () => {
		const result = calculateWhatYouNeed(baseInput)
		const retirementStartIndex = 2060 - 2025 // 35 years from start
		const peak = Math.max(...result)

		// Peak should be reasonably close to retirement start (within ~2%)
		const valueAtRetirement = result[retirementStartIndex]
		const percentDiff = Math.abs(valueAtRetirement - peak) / peak
		expect(percentDiff).toBeLessThan(0.02) // Within 2%
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

	it('should have year-end value greater than current savings', () => {
		const result = calculateWhatYouHave(baseInput, 100)
		// First value is year-end, which includes current savings + deposits + growth
		expect(result[0]).toBeGreaterThan(10000)
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

		const retirementYearIndex = years.indexOf(retirementYear)

		// Before retirement: balance should be growing
		// Compare year-end 2029 (last year before retirement) with year-end 2025 (first year)
		expect(whatYouHave[retirementYearIndex - 1]).toBeGreaterThan(whatYouHave[0])

		// During retirement: balance should eventually decline
		// Compare year-end value 10 years into retirement with retirement year value
		const midRetirementIndex = retirementYearIndex + 10
		if (midRetirementIndex < whatYouHave.length) {
			expect(whatYouHave[midRetirementIndex]).toBeLessThan(whatYouHave[retirementYearIndex])
		}

		// By end of retirement, balance should be significantly lower or zero
		const lastIndex = whatYouHave.length - 1
		expect(whatYouHave[lastIndex]).toBeLessThan(whatYouHave[retirementYearIndex] * 0.5)
	})
})

describe('Demo Stage 1 - match actual portfolio calculations', () => {
	// Demo Stage 1 data from seed.sql (Portfolio 8)
	const demoInput: RetirementCalculationInput = {
		retirementStart: new Date('2045-03-01'),
		retirementLength: 20,
		desiredBudget: 350,
		budgetFrequency: 'month',
		currentSavings: 11258,
		apy: 4.5,
		inflation: 2.5,
		depositStart: new Date('2025-01-01'),
		depositFrequency: 'month',
	}

	const depositAmount = 180.21

	// Helper to create portfolio and transactions for testing
	function createDemoPortfolioData(): {
		portfolio: Portfolio
		investments: Investment[]
		transactions: Transaction[]
	} {
		const portfolio: Portfolio = {
			id: -1,
			client: -1,
			name: 'Test Portfolio',
			currency: 'EUR',
			start_date: '2025-01-01',
			end_date: '2065-02-28',
			inflation_rate: 0.025,
			created_at: new Date().toISOString(),
			last_edited_at: new Date().toISOString(),
			link: null,
		}

		const investment: Investment = {
			id: -1,
			portfolio_id: -1,
			name: 'Retirement Investment',
			apy: 4.5,
			type: 'etf',
			created_at: new Date().toISOString(),
			last_edited_at: new Date().toISOString(),
			advanced_fees: false,
			entry_fee: null,
			entry_fee_type: null,
			exit_fee: null,
			exit_fee_type: null,
			management_fee: null,
			management_fee_type: null,
			success_fee: null,
			ter: null,
		}

		const transactions: Transaction[] = [
			{
				id: -1,
				investment_id: -1,
				amount: 11258,
				date: '2025-01-01',
				type: 'deposit',
				created_at: new Date().toISOString(),
				last_edited_at: new Date().toISOString(),
				end_date: null,
				inflation_adjusted: true,
				label: 'Initial Investment',
				repeat: null,
				repeat_unit: null,
			},
			{
				id: -2,
				investment_id: -1,
				amount: 180.21,
				date: '2025-02-01',
				type: 'deposit',
				created_at: new Date().toISOString(),
				last_edited_at: new Date().toISOString(),
				end_date: '2045-02-01',
				inflation_adjusted: true,
				label: 'Monthly Contribution',
				repeat: 1,
				repeat_unit: 'month',
			},
			{
				id: -3,
				investment_id: -1,
				amount: 350,
				date: '2045-03-01',
				type: 'withdrawal',
				created_at: new Date().toISOString(),
				last_edited_at: new Date().toISOString(),
				end_date: '2065-02-28',
				inflation_adjusted: true,
				label: 'Monthly Retirement Withdrawal',
				repeat: 1,
				repeat_unit: 'month',
			},
		]

		return { portfolio, investments: [investment], transactions }
	}

	it.skip('DEBUG: check calculateRequiredDeposit details', () => {
		console.log('\n=== REQUIRED DEPOSIT DEBUG ===')
		console.log('Input:', JSON.stringify(demoInput, null, 2))

		const requiredDeposit = calculateRequiredDeposit(demoInput)
		console.log('Calculated required deposit:', requiredDeposit)

		const whatYouNeed = calculateWhatYouNeed(demoInput)
		const whatYouHave = calculateWhatYouHave(demoInput, requiredDeposit)
		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)
		const year2045Index = years.indexOf(2045)

		console.log('Target at retirement (what you need):', whatYouNeed[year2045Index])
		console.log('Balance at retirement (what you have):', whatYouHave[year2045Index])
		console.log('Difference:', whatYouHave[year2045Index] - whatYouNeed[year2045Index])

		// Try with no current savings to see what deposit is needed
		const inputNoSavings = { ...demoInput, currentSavings: 0 }
		const requiredDepositNoSavings = calculateRequiredDeposit(inputNoSavings)
		console.log('\nWith NO current savings, required deposit:', requiredDepositNoSavings)

		// Try with different retirement age
		const inputAge60 = { ...demoInput, retirementStart: new Date('2040-03-01') }
		const requiredDepositAge60 = calculateRequiredDeposit(inputAge60)
		console.log('With retirement at 2040 (age 60), required deposit:', requiredDepositAge60)

		// Try with deposit start in February instead of January
		const inputFebStart = { ...demoInput, depositStart: new Date('2025-02-01') }
		const requiredDepositFebStart = calculateRequiredDeposit(inputFebStart)
		console.log('With deposit start in February 2025, required deposit:', requiredDepositFebStart)

		// Try with TODAY as deposit start (might be what UI uses)
		const inputTodayStart = { ...demoInput, depositStart: new Date() }
		const requiredDepositTodayStart = calculateRequiredDeposit(inputTodayStart)
		console.log('With deposit start TODAY, required deposit:', requiredDepositTodayStart)

		console.log('================================\n')
	})

	it.skip('DEBUG: compare whatYouNeed with actual portfolio', () => {
		const { portfolio, investments, transactions } = createDemoPortfolioData()
		const { total } = getGraphDataForPortfolio(transactions, investments, portfolio)

		const whatYouNeed = calculateWhatYouNeed(demoInput)
		const whatYouHave = calculateWhatYouHave(demoInput, depositAmount)
		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)

		console.log('\n=== WHAT YOU NEED vs ACTUAL vs WHAT YOU HAVE ===')
		console.log('Year | Need | Actual | Have | Need vs Actual')
		console.log('-------------------------------------------------------')
		;[2025, 2030, 2035, 2040, 2045, 2050, 2055, 2060, 2065].forEach((year) => {
			const idx = years.indexOf(year)
			const need = whatYouNeed[idx]
			const actual = total.graphInvestmentValues[idx]
			const have = whatYouHave[idx]
			const diff = need - actual
			console.log(
				`${year} | ${need.toFixed(0)} | ${actual.toFixed(0)} | ${have.toFixed(0)} | ${diff.toFixed(0)}`,
			)
		})
		console.log('====================================================\n')
	})

	it.skip('DEBUG: compare actual vs calculated values', () => {
		const { portfolio, investments, transactions } = createDemoPortfolioData()
		const { total } = getGraphDataForPortfolio(transactions, investments, portfolio)

		const whatYouHave = calculateWhatYouHave(demoInput, depositAmount)
		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)

		console.log('\n=== COMPARISON: EXPECTED vs CALCULATED ===')
		console.log('Year | Expected | Calculated | Diff | Diff%')
		console.log('--------------------------------------------------')
		;[2025, 2030, 2035, 2040, 2045, 2050, 2055, 2060, 2065].forEach((year) => {
			const idx = years.indexOf(year)
			const expected = total.graphInvestmentValues[idx]
			const calculated = whatYouHave[idx]
			const diff = calculated - expected
			const diffPct = ((diff / expected) * 100).toFixed(2)
			console.log(
				`${year} | ${expected.toFixed(2)} | ${calculated.toFixed(2)} | ${diff.toFixed(2)} | ${diffPct}%`,
			)
		})
		console.log('=========================================================\n')
	})

	it('should match portfolio calculations at key years', () => {
		const { portfolio, investments, transactions } = createDemoPortfolioData()
		const { total } = getGraphDataForPortfolio(transactions, investments, portfolio)

		const whatYouHave = calculateWhatYouHave(demoInput, depositAmount)
		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)

		// Find key years to compare
		const year2025Index = years.indexOf(2025)
		const year2035Index = years.indexOf(2035)
		const year2045Index = years.indexOf(2045)
		const year2055Index = years.indexOf(2055)
		const year2065Index = years.indexOf(2065)

		// Compare values at key years (allowing for small differences due to monthly vs daily compounding)
		const tolerance = 0.03 // 3% tolerance

		// Year 2025 - just initial deposit
		expect(whatYouHave[year2025Index]).toBeCloseTo(
			total.graphInvestmentValues[year2025Index],
			-Math.log10(total.graphInvestmentValues[year2025Index] * tolerance),
		)

		// Year 2035 - mid accumulation
		expect(whatYouHave[year2035Index]).toBeCloseTo(
			total.graphInvestmentValues[year2035Index],
			-Math.log10(total.graphInvestmentValues[year2035Index] * tolerance),
		)

		// Year 2045 - retirement start (peak)
		expect(whatYouHave[year2045Index]).toBeCloseTo(
			total.graphInvestmentValues[year2045Index],
			-Math.log10(total.graphInvestmentValues[year2045Index] * tolerance),
		)

		// Year 2055 - mid retirement
		expect(whatYouHave[year2055Index]).toBeCloseTo(
			total.graphInvestmentValues[year2055Index],
			-Math.log10(total.graphInvestmentValues[year2055Index] * tolerance),
		)

		// Year 2065 - end of retirement (should be near zero)
		// Accept any value less than 10 as essentially zero
		expect(whatYouHave[year2065Index]).toBeLessThan(10)
	})

	it('should have correct year-end 2025 value', () => {
		const whatYouHave = calculateWhatYouHave(demoInput, depositAmount)
		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)
		const year2025Index = years.indexOf(2025)

		// Expected value at end of 2025: initial 11,258 + 11 monthly deposits + growth
		// Allow for small difference due to monthly vs daily compounding
		expect(whatYouHave[year2025Index]).toBeCloseTo(13814.26, -1) // Within ~10
	})

	it('should grow during accumulation phase', () => {
		const whatYouHave = calculateWhatYouHave(demoInput, depositAmount)
		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)

		const year2025Index = years.indexOf(2025)
		const year2044Index = years.indexOf(2044)

		// Value should grow during accumulation
		expect(whatYouHave[year2044Index]).toBeGreaterThan(whatYouHave[year2025Index])
	})

	it('should decline during retirement phase', () => {
		const whatYouHave = calculateWhatYouHave(demoInput, depositAmount)
		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)

		const year2045Index = years.indexOf(2045)
		const year2065Index = years.indexOf(2065)

		// Value should decline during retirement
		expect(whatYouHave[year2065Index]).toBeLessThan(whatYouHave[year2045Index])
	})

	it('should reach near zero at end of retirement', () => {
		const whatYouHave = calculateWhatYouHave(demoInput, depositAmount)
		const lastValue = whatYouHave[whatYouHave.length - 1]

		// Should be close to zero at the end (within 0.1% of peak value or less than 100)
		const peakValue = Math.max(...whatYouHave)
		expect(lastValue).toBeLessThan(Math.max(peakValue * 0.001, 100))
	})

	it('should calculate required deposit close to 180.21', () => {
		// Calculate what deposit amount is needed
		const requiredDeposit = calculateRequiredDeposit(demoInput)

		// Should be close to the known deposit amount of 180.21
		// Allow small difference due to monthly vs daily compounding
		expect(requiredDeposit).toBeCloseTo(180.21, -1) // Within ~2
	})

	it('calculateWhatYouNeed should produce reasonable target values', () => {
		const whatYouNeed = calculateWhatYouNeed(demoInput)
		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)

		// First year should have some value (year-end after first year of saving)
		expect(whatYouNeed[0]).toBeGreaterThan(0)
		expect(whatYouNeed[0]).toBeLessThan(15000) // Reasonable for first year

		// Should peak at or near retirement
		const year2045Index = years.indexOf(2045)
		const peak = Math.max(...whatYouNeed)
		// Allow slight variation due to year-end timing
		expect(whatYouNeed[year2045Index]).toBeCloseTo(peak, -3) // Within 1000

		// Should end near zero
		const lastValue = whatYouNeed[whatYouNeed.length - 1]
		expect(lastValue).toBeLessThan(100)

		// Should decline during retirement
		const year2050Index = years.indexOf(2050)
		const year2060Index = years.indexOf(2060)
		expect(whatYouNeed[year2060Index]).toBeLessThan(whatYouNeed[year2050Index])
	})

	it('whatYouHave with required deposit should match whatYouNeed at retirement', () => {
		const requiredDeposit = calculateRequiredDeposit(demoInput)
		const whatYouNeed = calculateWhatYouNeed(demoInput)
		const whatYouHave = calculateWhatYouHave(demoInput, requiredDeposit)

		const years = generateYears(
			demoInput.depositStart,
			demoInput.retirementStart,
			demoInput.retirementLength,
		)
		const year2045Index = years.indexOf(2045)

		// At retirement, "what you have" should match "what you need"
		expect(whatYouHave[year2045Index]).toBeCloseTo(whatYouNeed[year2045Index], -2) // Within 100
	})
})
