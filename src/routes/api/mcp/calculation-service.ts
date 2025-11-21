import type { Investment, Portfolio, Transaction } from '$lib/types'
import {
	getInvestmentValues,
	getCurrentPortfolioValue,
	getGraphDataForPortfolio,
	getBaseData,
} from '$lib/@snaha/kalkul-maths'

export interface InvestmentScenario {
	investment: Investment
	transactions: Transaction[]
}

export interface PortfolioScenario {
	portfolio: Portfolio
	investments: Investment[]
	transactions: Transaction[]
}

export interface ProjectionResult {
	investmentValues: number[]
	totalDeposits: number[]
	totalWithdrawals: number[]
	totalFees: number[]
	labels: string[]
	finalValue: number
	totalReturn: number
	totalInterest: number
	depletionDate?: string
}

export interface PortfolioProjectionResult {
	totalValues: number[]
	investmentBreakdown: Array<{
		name: string
		values: number[]
		finalValue: number
	}>
	labels: string[]
	totalFinalValue: number
	totalReturn: number
	totalInterest: number
	depletionDate?: string
}

export interface ScenarioComparison {
	baseline: PortfolioProjectionResult
	modified: PortfolioProjectionResult
	improvements: {
		sustainabilityImproved: boolean
		finalValueDifference: number
		returnDifference: number
		depletionDelayed: boolean
		depletionDateDifference?: string
	}
	recommendation: string
}

/**
 * Calculate investment projection for a single investment
 */
export function calculateInvestmentProjection(scenario: InvestmentScenario): ProjectionResult {
	const baseData = getBaseData(scenario.transactions)

	if (scenario.transactions.length === 0) {
		return {
			investmentValues: [],
			totalDeposits: [],
			totalWithdrawals: [],
			totalFees: [],
			labels: [],
			finalValue: 0,
			totalReturn: 0,
			totalInterest: 0,
		}
	}

	const { period, count } = getSamplingPeriodCount(baseData.startDate, baseData.endDate)

	const { investmentValues, feeValues, withdrawalValues, depositValues } = getInvestmentValues(
		{ period, count },
		baseData,
		scenario.investment,
	)

	const labels = generateLabels(baseData.startDate, baseData.endDate, period, count)
	const finalValue = investmentValues[investmentValues.length - 1] || 0

	// Calculate totals
	const totalDeposits = depositValues.reduce((sum, val) => sum + val, 0)
	const totalWithdrawals = Math.abs(withdrawalValues.reduce((sum, val) => sum + val, 0))
	const totalFees = Math.abs(
		feeValues.reduce(
			(sum, fee) =>
				sum + fee.entryFee + fee.exitFee + fee.managementFee + fee.successFee + fee.TERFee,
			0,
		),
	)

	const totalReturn = finalValue + totalWithdrawals - totalDeposits
	const totalInterest = totalReturn + totalFees

	// Check for depletion
	const depletionIndex = investmentValues.findIndex((val) => val <= 0)
	const depletionDate = depletionIndex >= 0 ? labels[depletionIndex] : undefined

	return {
		investmentValues,
		totalDeposits: depositValues,
		totalWithdrawals: withdrawalValues.map((val) => Math.abs(val)),
		totalFees: feeValues.map((fee) =>
			Math.abs(fee.entryFee + fee.exitFee + fee.managementFee + fee.successFee + fee.TERFee),
		),
		labels,
		finalValue,
		totalReturn,
		totalInterest,
		depletionDate,
	}
}

/**
 * Calculate full portfolio projection
 */
export function calculatePortfolioProjection(
	scenario: PortfolioScenario,
): PortfolioProjectionResult {
	const { data, total } = getGraphDataForPortfolio(
		scenario.transactions,
		scenario.investments,
		scenario.portfolio,
	)

	const investmentBreakdown = data.map((graphData, index) => ({
		name: scenario.investments[index].name,
		values: graphData.graphInvestmentValues,
		finalValue: graphData.graphInvestmentValues[graphData.graphInvestmentValues.length - 1] || 0,
	}))

	const totalFinalValue = total.graphInvestmentValues[total.graphInvestmentValues.length - 1] || 0
	const totalDeposits = total.graphDeposits.reduce((sum, val) => sum + val, 0)
	const totalWithdrawals = Math.abs(total.graphWithdrawals.reduce((sum, val) => sum + val, 0))
	const totalFees = Math.abs(total.graphFeeValues.reduce((sum, val) => sum + val, 0))

	const totalReturn = totalFinalValue + totalWithdrawals - totalDeposits
	const totalInterest = totalReturn + totalFees

	// Check for overall portfolio depletion
	const depletionIndex = total.graphInvestmentValues.findIndex((val) => val <= 0)
	const depletionDate = depletionIndex >= 0 ? total.graphLabels[depletionIndex] : undefined

	return {
		totalValues: total.graphInvestmentValues,
		investmentBreakdown,
		labels: total.graphLabels,
		totalFinalValue,
		totalReturn,
		totalInterest,
		depletionDate,
	}
}

/**
 * Get current portfolio value as of today
 */
export function getCurrentPortfolioValueService(
	investments: Investment[],
	transactions: Transaction[],
): number {
	const transactionStore = {
		filter: (investmentId: string) => transactions.filter((t) => t.investment_id === investmentId),
	}

	return getCurrentPortfolioValue(transactionStore, investments)
}

/**
 * Compare two portfolio scenarios
 */
export function compareScenarios(
	baseline: PortfolioScenario,
	modified: PortfolioScenario,
): ScenarioComparison {
	const baselineResult = calculatePortfolioProjection(baseline)
	const modifiedResult = calculatePortfolioProjection(modified)

	const finalValueDifference = modifiedResult.totalFinalValue - baselineResult.totalFinalValue
	const returnDifference = modifiedResult.totalReturn - baselineResult.totalReturn

	const sustainabilityImproved = !modifiedResult.depletionDate && !!baselineResult.depletionDate
	const depletionDelayed =
		!!baselineResult.depletionDate &&
		!!modifiedResult.depletionDate &&
		modifiedResult.depletionDate > baselineResult.depletionDate

	let recommendation = ''
	if (sustainabilityImproved) {
		recommendation =
			'Recommended: This scenario eliminates portfolio depletion and ensures sustainability.'
	} else if (depletionDelayed) {
		recommendation = `Improved: Portfolio depletion delayed from ${baselineResult.depletionDate} to ${modifiedResult.depletionDate}.`
	} else if (finalValueDifference > 0) {
		recommendation = `Improved: Final portfolio value increases by €${Math.round(finalValueDifference).toLocaleString()}.`
	} else if (finalValueDifference < 0) {
		recommendation = `Caution: Final portfolio value decreases by €${Math.round(Math.abs(finalValueDifference)).toLocaleString()}.`
	} else {
		recommendation = 'Neutral: No significant impact on portfolio performance.'
	}

	return {
		baseline: baselineResult,
		modified: modifiedResult,
		improvements: {
			sustainabilityImproved,
			finalValueDifference,
			returnDifference,
			depletionDelayed,
			depletionDateDifference:
				modifiedResult.depletionDate && baselineResult.depletionDate
					? `${Math.abs(new Date(modifiedResult.depletionDate).getTime() - new Date(baselineResult.depletionDate).getTime()) / (1000 * 60 * 60 * 24 * 365)} years`
					: undefined,
		},
		recommendation,
	}
}

// Helper functions
function getSamplingPeriodCount(
	startDate: Date,
	endDate: Date,
): { period: 'month' | 'year'; count: number } {
	const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
	if (years < 5) return { period: 'month', count: 1 }
	return { period: 'year', count: 1 }
}

function generateLabels(
	startDate: Date,
	endDate: Date,
	period: 'month' | 'year',
	count: number,
): string[] {
	const labels = []
	if (period === 'year') {
		const startYear = startDate.getFullYear()
		const endYear = endDate.getFullYear()
		for (let year = startYear; year <= endYear; year += count) {
			labels.push(year.toString())
		}
	} else {
		const startYear = startDate.getFullYear()
		const startMonth = startDate.getMonth()
		const endYear = endDate.getFullYear()
		const endMonth = endDate.getMonth()

		let currentYear = startYear
		let currentMonth = startMonth

		while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
			labels.push(`${currentYear}-${currentMonth + 1}`)
			currentMonth += count
			if (currentMonth > 11) {
				currentYear += Math.floor(currentMonth / 12)
				currentMonth = currentMonth % 12
			}
		}
	}
	return labels
}
