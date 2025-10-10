import Decimal from 'decimal.js'

export type RetirementCalculationInput = {
	retirementStart: Date
	retirementLength: number
	desiredBudget: number
	budgetFrequency: 'month' | 'year'
	currentSavings: number
	apy: number
	inflation: number
	depositStart: Date
	depositFrequency: 'month' | 'year'
}

/**
 * Calculate "what you need" data - the target portfolio balance at each year
 * Shows the minimum balance needed at each point to successfully reach retirement goals
 *
 * During accumulation: target balance grows from 0 to peak at retirement start
 * During retirement: balance declines as withdrawals are made (earning APY on remaining balance)
 */
export function calculateWhatYouNeed(input: RetirementCalculationInput): number[] {
	const {
		retirementStart,
		retirementLength,
		desiredBudget,
		budgetFrequency,
		inflation,
		depositStart,
		apy,
	} = input

	const startYear = depositStart.getFullYear()
	const retirementStartYear = retirementStart.getFullYear()
	const endYear = retirementStartYear + retirementLength

	// Convert budget to annual if monthly
	const annualBudget = new Decimal(budgetFrequency === 'month' ? desiredBudget * 12 : desiredBudget)
	const inflationRate = new Decimal(inflation).div(100)
	const apyRate = new Decimal(apy).div(100)

	const values: number[] = []

	// Step 1: Calculate balances during retirement (working backwards from end)
	const retirementBalances: Decimal[] = []

	// At end of retirement, balance should be 0
	retirementBalances[retirementLength] = new Decimal(0)

	// Work backwards: what balance do we need at start of each year?
	for (let i = retirementLength - 1; i >= 0; i--) {
		const yearsFromRetirementStart = i
		// Budget for this year, adjusted for inflation
		const inflatedBudget = annualBudget.mul(
			new Decimal(1).plus(inflationRate).pow(yearsFromRetirementStart),
		)

		// At start of year: balance grows by APY, then we withdraw
		// balance * (1 + apy) - withdrawal = balance at start of next year
		// So: balance = (next_year_balance + withdrawal) / (1 + apy)
		const nextYearBalance = retirementBalances[i + 1]
		const thisYearStartBalance = nextYearBalance
			.plus(inflatedBudget)
			.div(new Decimal(1).plus(apyRate))
		retirementBalances[i] = thisYearStartBalance
	}

	// Step 2: Calculate target balance during accumulation phase
	// This is the balance needed at each year to be "on track"
	const balanceNeededAtRetirement = retirementBalances[0]

	// Generate year by year data
	for (let year = startYear; year <= endYear; year++) {
		if (year === startYear) {
			// Start at 0
			values.push(0)
		} else if (year < retirementStartYear) {
			// Accumulation phase: exponential growth from 0 to peak at retirement
			// This shows the target if you're saving with compound growth
			const yearsFromStart = year - startYear
			const totalYearsToRetirement = retirementStartYear - startYear

			// Exponential growth: (1 + apy)^years
			const growthFactor = new Decimal(1).plus(apyRate).pow(yearsFromStart)
			const maxGrowthFactor = new Decimal(1).plus(apyRate).pow(totalYearsToRetirement)

			// Normalize to range [0, balanceNeededAtRetirement]
			const targetBalance = balanceNeededAtRetirement.mul(
				growthFactor.minus(1).div(maxGrowthFactor.minus(1)),
			)

			values.push(targetBalance.toNumber())
		} else {
			// Retirement phase: use pre-calculated declining balances
			const yearIndex = year - retirementStartYear
			if (yearIndex < retirementBalances.length) {
				values.push(retirementBalances[yearIndex].toNumber())
			} else {
				values.push(0)
			}
		}
	}

	return values
}

/**
 * Calculate "what you have" data - projected portfolio balance with regular deposits
 * Shows accumulation during working years and withdrawal during retirement
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
		depositFrequency,
		desiredBudget,
		budgetFrequency,
	} = input

	const startYear = depositStart.getFullYear()
	const retirementStartYear = retirementStart.getFullYear()
	const endYear = retirementStartYear + retirementLength

	const apyRate = new Decimal(apy).div(100)
	const inflationRate = new Decimal(inflation).div(100)

	// Convert deposit to annual amount
	let annualDeposit = new Decimal(depositAmount)
	if (depositFrequency === 'month') {
		annualDeposit = annualDeposit.mul(12)
	}

	// Convert budget to annual
	const annualBudget = new Decimal(budgetFrequency === 'month' ? desiredBudget * 12 : desiredBudget)

	const values: number[] = []
	let balance = new Decimal(currentSavings)

	// Generate year by year data
	for (let year = startYear; year <= endYear; year++) {
		values.push(balance.toNumber())

		if (year < retirementStartYear) {
			// Accumulation phase: deposit at start of year, then grow
			const yearsFromStart = year - startYear
			// Adjust deposit for inflation
			const inflatedDeposit = annualDeposit.mul(
				new Decimal(1).plus(inflationRate).pow(yearsFromStart),
			)
			balance = balance.plus(inflatedDeposit)
			balance = balance.mul(new Decimal(1).plus(apyRate))
		} else {
			// Retirement phase: grow first, then withdraw
			const yearsFromRetirementStart = year - retirementStartYear
			const inflatedBudget = annualBudget.mul(
				new Decimal(1).plus(inflationRate).pow(yearsFromRetirementStart),
			)
			balance = balance.mul(new Decimal(1).plus(apyRate))
			balance = balance.minus(inflatedBudget)

			// Don't go negative
			if (balance.lessThan(0)) {
				balance = new Decimal(0)
			}
		}
	}

	return values
}

/**
 * Calculate the required deposit amount to reach retirement goals
 * Uses binary search to find the deposit that matches target at retirement
 */
export function calculateRequiredDeposit(input: RetirementCalculationInput): number {
	const whatYouNeed = calculateWhatYouNeed(input)
	const retirementStartIndex =
		input.retirementStart.getFullYear() - input.depositStart.getFullYear()
	const targetAtRetirement = whatYouNeed[retirementStartIndex]

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
 * Generate years array for the chart
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
