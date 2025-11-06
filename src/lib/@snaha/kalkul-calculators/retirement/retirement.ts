import Decimal from 'decimal.js'
import { DECIMAL_0, DECIMAL_1 } from '$lib/@snaha/kalkul-maths/constants'

export type RetirementCalculationInput = {
	retirementStart: Date
	retirementLength: number
	desiredBudget: number
	budgetPeriod: 'month' | 'year'
	currentSavings: number
	apy: number
	inflation: number
	depositStart: Date
	depositPeriod: 'month' | 'year'
}

/**
 * Calculates the target portfolio balance needed at retirement start.
 *
 * Works backward from retirement end (when balance should reach zero) to determine
 * the starting balance needed at the beginning of retirement. Takes into account:
 * - Monthly or yearly budget withdrawals during retirement
 * - Inflation adjustments for withdrawals over time
 * - Monthly portfolio growth during retirement (APY compounded monthly)
 *
 * @param input - Retirement calculation parameters including retirement dates, budget, APY, and inflation
 * @returns The required balance at retirement start to sustain withdrawals until the end
 */
function calculateTargetBalanceAtRetirement(input: RetirementCalculationInput): number {
	const {
		retirementStart,
		retirementLength,
		desiredBudget,
		budgetPeriod,
		inflation,
		depositStart,
		apy,
	} = input

	const startYear = depositStart.getFullYear()
	const retirementStartYear = retirementStart.getFullYear()
	const retirementStartMonth = retirementStart.getMonth()

	const apyRate = new Decimal(apy).div(100)
	const inflationRate = new Decimal(inflation).div(100)

	// Pre-calculate common values
	const oneOverTwelve = DECIMAL_1.div(12)
	const monthlyRate = DECIMAL_1.plus(apyRate).pow(oneOverTwelve)
	const monthlyInflationRate = DECIMAL_1.plus(inflationRate).pow(oneOverTwelve)

	// Calculate retirement phase month-by-month, working backwards from end
	const retirementMonthlyBalances: Decimal[] = []
	const totalRetirementMonths = retirementLength * 12

	// At end of retirement, balance should be 0
	retirementMonthlyBalances[totalRetirementMonths] = DECIMAL_0

	// Work backwards through retirement
	// Pre-calculate inflation multipliers for efficiency (working backwards)
	const totalMonths = (retirementStartYear - startYear) * 12 + totalRetirementMonths
	let inflationMultiplier = monthlyInflationRate.pow(totalMonths)

	for (let monthIndex = totalRetirementMonths - 1; monthIndex >= 0; monthIndex--) {
		// Update inflation multiplier (going backwards means dividing)
		inflationMultiplier = inflationMultiplier.div(monthlyInflationRate)

		// Calculate withdrawal for this month
		let withdrawal = DECIMAL_0
		if (budgetPeriod === 'month') {
			withdrawal = new Decimal(desiredBudget).mul(inflationMultiplier)
		} else if (budgetPeriod === 'year') {
			// Yearly withdrawal at retirement start month
			const monthInYear = monthIndex % 12
			if (monthInYear === retirementStartMonth) {
				withdrawal = new Decimal(desiredBudget).mul(inflationMultiplier)
			}
		}

		// Work backwards: balance after growth and withdrawal = next month's balance
		// balance * monthlyRate - withdrawal = nextBalance
		// So: balance = (nextBalance + withdrawal) / monthlyRate
		const nextBalance = retirementMonthlyBalances[monthIndex + 1]
		const thisBalance = nextBalance.plus(withdrawal).div(monthlyRate)
		retirementMonthlyBalances[monthIndex] = thisBalance
	}

	// The balance needed at retirement start (beginning of first retirement month)
	return retirementMonthlyBalances[0].toNumber()
}

/**
 * Calculates the required regular deposit amount to reach retirement goals.
 *
 * Uses binary search to efficiently find the deposit amount that will result in
 * the target balance at retirement start. The algorithm:
 * - Determines target balance needed at retirement using backwards calculation
 * - Iteratively tests deposit amounts to find one that reaches the target
 * - Converges to within 0.1% tolerance or 50 iterations
 *
 * @param input - Retirement calculation parameters including savings, deposits, and goals
 * @returns The required deposit amount per period (rounded to 2 decimal places)
 * @example
 * // Returns monthly deposit needed to reach retirement goal
 * calculateRequiredDeposit({
 *   retirementStart: new Date('2050-01-01'),
 *   retirementLength: 30,
 *   desiredBudget: 50000,
 *   budgetPeriod: 'year',
 *   currentSavings: 10000,
 *   apy: 7,
 *   inflation: 3,
 *   depositStart: new Date('2025-01-01'),
 *   depositPeriod: 'month'
 * })
 */
export function calculateRequiredDeposit(input: RetirementCalculationInput): number {
	const targetAtRetirement = calculateTargetBalanceAtRetirement(input)
	const retirementStartIndex =
		input.retirementStart.getFullYear() - input.depositStart.getFullYear()

	// If target is 0 or we're already at retirement, no deposit needed
	if (targetAtRetirement <= 0 || retirementStartIndex <= 0) {
		return 0
	}

	// Binary search for the right deposit amount
	let low = 0
	let high = targetAtRetirement // Upper bound (way more than needed)
	let iterations = 0
	const maxIterations = 50
	const tolerance = targetAtRetirement * 0.001 // 0.1% tolerance

	while (iterations < maxIterations && high - low > 0.01) {
		const mid = (low + high) / 2
		const whatYouHave = calculateWhatYouHave(input, mid)
		const balanceAtRetirement = whatYouHave[retirementStartIndex]

		if (Math.abs(balanceAtRetirement - targetAtRetirement) < tolerance) {
			return Math.round(mid * 100) / 100 // Round to 2 decimal places
		}

		if (balanceAtRetirement < targetAtRetirement) {
			low = mid
		} else {
			high = mid
		}

		iterations++
	}

	// Return the midpoint of final range
	return Math.round(((low + high) / 2) * 100) / 100
}

/**
 * Calculates projected portfolio balance over time with regular deposits and withdrawals.
 *
 * Simulates the entire financial lifecycle month-by-month:
 * - **Accumulation phase**: Regular deposits (monthly or yearly) with growth until retirement
 * - **Retirement phase**: Regular withdrawals (monthly or yearly) with continued growth
 * - All amounts are adjusted for inflation over time
 * - Growth is compounded monthly based on APY
 *
 * @param input - Retirement calculation parameters including all financial assumptions
 * @param depositAmount - The amount to deposit each period (monthly or yearly)
 * @returns Array of year-end balances (December 31) from deposit start through retirement end
 * @example
 * // Returns [balance_year1, balance_year2, ..., balance_yearN]
 * calculateWhatYouHave(input, 1000) // With $1000 monthly deposits
 */
export function calculateWhatYouHave(
	input: RetirementCalculationInput,
	depositAmount: number,
): number[] {
	const {
		retirementStart,
		retirementLength,
		currentSavings,
		apy,
		inflation,
		depositStart,
		depositPeriod,
		desiredBudget,
		budgetPeriod,
	} = input

	const startYear = depositStart.getFullYear()
	const startMonth = depositStart.getMonth() // 0-11
	const retirementStartYear = retirementStart.getFullYear()
	const retirementStartMonth = retirementStart.getMonth()
	const endYear = retirementStartYear + retirementLength

	const apyRate = new Decimal(apy).div(100)
	const inflationRate = new Decimal(inflation).div(100)

	// Pre-calculate common values
	const oneOverTwelve = DECIMAL_1.div(12)
	const monthlyRate = DECIMAL_1.plus(apyRate).pow(oneOverTwelve)
	const monthlyInflationRate = DECIMAL_1.plus(inflationRate).pow(oneOverTwelve)

	const values: number[] = []
	let balance = DECIMAL_0
	let inflationMultiplier = DECIMAL_1

	// Work month by month
	let currentYear = startYear
	let currentMonth = startMonth
	let monthsSinceStart = 0

	// Track when we've passed retirement start
	let inRetirement = false

	while (currentYear <= endYear) {
		// Check if we've entered retirement (happens at retirement start month)
		if (
			currentYear > retirementStartYear ||
			(currentYear === retirementStartYear && currentMonth >= retirementStartMonth)
		) {
			inRetirement = true
		}

		// Handle initial deposit on the very first month
		if (monthsSinceStart === 0) {
			balance = new Decimal(currentSavings)
		} else {
			// Update inflation multiplier incrementally for all months after the first
			inflationMultiplier = inflationMultiplier.mul(monthlyInflationRate)
		}

		// Add deposits BEFORE retirement starts (stop at the month before retirement)
		const isBeforeRetirement =
			currentYear < retirementStartYear ||
			(currentYear === retirementStartYear && currentMonth < retirementStartMonth)

		if (monthsSinceStart > 0 && isBeforeRetirement) {
			// Accumulation phase: add monthly deposit (inflation-adjusted)
			if (depositPeriod === 'month') {
				const inflatedDeposit = new Decimal(depositAmount).mul(inflationMultiplier)
				balance = balance.plus(inflatedDeposit)
			} else if (depositPeriod === 'year' && currentMonth === startMonth) {
				// Yearly deposits happen on the same month as start
				const inflatedDeposit = new Decimal(depositAmount).mul(inflationMultiplier)
				balance = balance.plus(inflatedDeposit)
			}
		}

		// Apply monthly growth
		balance = balance.mul(monthlyRate)

		// Handle withdrawals during retirement
		if (inRetirement) {
			let withdrawal = DECIMAL_0
			if (budgetPeriod === 'month') {
				withdrawal = new Decimal(desiredBudget).mul(inflationMultiplier)
			} else if (budgetPeriod === 'year' && currentMonth === retirementStartMonth) {
				// Yearly withdrawals happen on the same month as retirement start
				withdrawal = new Decimal(desiredBudget).mul(inflationMultiplier)
			}

			balance = balance.minus(withdrawal)

			// Don't go negative
			if (balance.lessThan(DECIMAL_0)) {
				balance = DECIMAL_0
			}
		}

		// Record year-end balance (December = month 11)
		if (currentMonth === 11) {
			values.push(balance.toNumber())
		}

		// Move to next month
		currentMonth++
		monthsSinceStart++
		if (currentMonth > 11) {
			currentMonth = 0
			currentYear++
		}
	}

	return values
}

/**
 * Generates an array of years for charting retirement projections.
 *
 * Creates a sequential array of years from the deposit start year through
 * the end of retirement period. Used as x-axis values for retirement charts.
 *
 * @param depositStart - The date when deposits begin
 * @param retirementStart - The date when retirement begins
 * @param retirementLength - Duration of retirement in years
 * @returns Array of years from deposit start to retirement end
 * @example
 * // Returns [2025, 2026, 2027, ..., 2055]
 * generateYears(new Date('2025-01-01'), new Date('2050-01-01'), 5)
 */
export function generateYears(
	depositStart: Date,
	retirementStart: Date,
	retirementLength: number,
): number[] {
	const startYear = depositStart.getFullYear()
	const endYear = retirementStart.getFullYear() + retirementLength
	const years: number[] = []

	for (let year = startYear; year <= endYear; year++) {
		years.push(year)
	}

	return years
}
