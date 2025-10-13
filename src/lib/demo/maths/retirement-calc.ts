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
 * Returns year-end balances (Dec 31) to match calculateWhatYouHave
 * During accumulation: target balance grows to peak at retirement start
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
	const retirementStartMonth = retirementStart.getMonth()
	const endYear = retirementStartYear + retirementLength

	const apyRate = new Decimal(apy).div(100)
	const inflationRate = new Decimal(inflation).div(100)

	// Monthly growth rate (compound monthly)
	const monthlyRate = new Decimal(1).plus(apyRate).pow(new Decimal(1).div(12))

	// Step 1: Calculate retirement phase month-by-month, working backwards from end
	const retirementMonthlyBalances: Decimal[] = []
	const totalRetirementMonths = retirementLength * 12

	// At end of retirement, balance should be 0
	retirementMonthlyBalances[totalRetirementMonths] = new Decimal(0)

	// Work backwards through retirement
	for (let monthIndex = totalRetirementMonths - 1; monthIndex >= 0; monthIndex--) {
		const monthsSinceStart = (retirementStartYear - startYear) * 12 + monthIndex
		const yearsFromStart = monthsSinceStart / 12
		const inflationMultiplier = new Decimal(1).plus(inflationRate).pow(yearsFromStart)

		// Calculate withdrawal for this month
		let withdrawal = new Decimal(0)
		if (budgetFrequency === 'month') {
			withdrawal = new Decimal(desiredBudget).mul(inflationMultiplier)
		} else if (budgetFrequency === 'year') {
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
	const balanceNeededAtRetirement = retirementMonthlyBalances[0]

	// Step 2: Calculate accumulation phase
	// We want to reach balanceNeededAtRetirement by end of last pre-retirement year
	const values: number[] = []
	const totalAccumulationMonths = (retirementStartYear - startYear) * 12 + retirementStartMonth

	// During accumulation, show exponential growth curve from 0 to target
	for (let year = startYear; year <= endYear; year++) {
		// For each year, calculate the year-end balance (Dec 31)
		const monthsSinceStart = (year - startYear) * 12 + 12 // End of this year

		if (year < retirementStartYear || (year === retirementStartYear && 11 < retirementStartMonth)) {
			// Accumulation phase: exponential growth
			// Use formula: target * (growth^months - 1) / (growth^total - 1)
			const growthFactor = monthlyRate.pow(monthsSinceStart)
			const maxGrowthFactor = monthlyRate.pow(totalAccumulationMonths)

			const targetBalance = balanceNeededAtRetirement.mul(
				growthFactor.minus(1).div(maxGrowthFactor.minus(1)),
			)

			values.push(targetBalance.toNumber())
		} else {
			// Retirement phase: use pre-calculated declining balances
			// Find the balance at end of this year (Dec 31)
			const monthsIntoRetirement = (year - retirementStartYear) * 12 + (11 - retirementStartMonth)

			if (monthsIntoRetirement >= 0 && monthsIntoRetirement < retirementMonthlyBalances.length) {
				values.push(retirementMonthlyBalances[monthsIntoRetirement].toNumber())
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
 *
 * Returns year-end balances (Dec 31) for each year from depositStart to retirement end
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
	const startMonth = depositStart.getMonth() // 0-11
	const retirementStartYear = retirementStart.getFullYear()
	const retirementStartMonth = retirementStart.getMonth()
	const endYear = retirementStartYear + retirementLength

	const apyRate = new Decimal(apy).div(100)
	const inflationRate = new Decimal(inflation).div(100)

	// Monthly growth rate (compound monthly)
	const monthlyRate = new Decimal(1).plus(apyRate).pow(new Decimal(1).div(12))

	const values: number[] = []
	let balance = new Decimal(0)

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
		}

		// Add deposits BEFORE retirement starts (stop at the month before retirement)
		const isBeforeRetirement =
			currentYear < retirementStartYear ||
			(currentYear === retirementStartYear && currentMonth < retirementStartMonth)

		if (monthsSinceStart > 0 && isBeforeRetirement) {
			// Accumulation phase: add monthly deposit (inflation-adjusted)
			const yearsFromStart = monthsSinceStart / 12
			const inflationMultiplier = new Decimal(1).plus(inflationRate).pow(yearsFromStart)

			if (depositFrequency === 'month') {
				const inflatedDeposit = new Decimal(depositAmount).mul(inflationMultiplier)
				balance = balance.plus(inflatedDeposit)
			} else if (depositFrequency === 'year' && currentMonth === startMonth) {
				// Yearly deposits happen on the same month as start
				const inflatedDeposit = new Decimal(depositAmount).mul(inflationMultiplier)
				balance = balance.plus(inflatedDeposit)
			}
		}

		// Apply monthly growth
		balance = balance.mul(monthlyRate)

		// Handle withdrawals during retirement
		if (inRetirement) {
			// For inflation-adjusted withdrawals, calculate from portfolio start, not retirement start
			const yearsFromStart = monthsSinceStart / 12
			const inflationMultiplier = new Decimal(1).plus(inflationRate).pow(yearsFromStart)

			let withdrawal = new Decimal(0)
			if (budgetFrequency === 'month') {
				withdrawal = new Decimal(desiredBudget).mul(inflationMultiplier)
			} else if (budgetFrequency === 'year' && currentMonth === retirementStartMonth) {
				// Yearly withdrawals happen on the same month as retirement start
				withdrawal = new Decimal(desiredBudget).mul(inflationMultiplier)
			}

			balance = balance.minus(withdrawal)

			// Don't go negative
			if (balance.lessThan(0)) {
				balance = new Decimal(0)
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
