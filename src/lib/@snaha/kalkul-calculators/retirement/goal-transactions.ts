import type { RetirementGoalData, Transaction } from '$lib/types'
import { formatDate } from '$lib/@snaha/kalkul-maths'
import { calculateRequiredDeposit } from './retirement'

type TransactionLabels = {
	initialSavings: string
	regularDeposit: string
	retirementWithdrawal: string
}

/**
 * Converts retirement goal data into a series of transaction records.
 *
 * Generates up to 3 transactions based on the retirement goal:
 * 1. **Initial deposit** - One-time deposit of current savings at deposit start (if > 0)
 * 2. **Regular deposits** - Recurring deposits from deposit start until retirement start (if > 0)
 * 3. **Regular withdrawals** - Recurring withdrawals during retirement period (if > 0)
 *
 * If no custom deposit amount is provided, it automatically calculates the required
 * deposit amount needed to reach the retirement goal.
 *
 * @param goalData - Retirement goal parameters including dates, amounts, and frequencies
 * @param investmentId - The investment ID to associate with the transactions
 * @param labels - Localized labels for the three transaction types
 * @returns Array of transaction objects (without IDs) ready to be inserted into the database
 * @example
 * // Returns array with 3 transactions: initial, deposits, withdrawals
 * retirementGoalToTransactions(
 *   goalData,
 *   123,
 *   { initialSavings: 'Initial', regularDeposit: 'Monthly', retirementWithdrawal: 'Budget' }
 * )
 */
export function retirementGoalToTransactions(
	goalData: RetirementGoalData,
	investmentId: number,
	labels: TransactionLabels,
): Omit<Transaction, 'id'>[] {
	const transactions: Omit<Transaction, 'id'>[] = []

	// Parse ISO date strings to Date objects
	const depositStart = new Date(goalData.depositStart)
	const retirementStart = new Date(goalData.retirementStart)

	// Add initial deposit if any
	if (goalData.currentSavings > 0) {
		transactions.push({
			investment_id: investmentId,
			amount: goalData.currentSavings,
			date: formatDate(depositStart),
			type: 'deposit',
			created_at: new Date().toISOString(),
			last_edited_at: new Date().toISOString(),
			end_date: null,
			inflation_adjusted: true,
			label: labels.initialSavings,
			repeat: null,
			repeat_unit: null,
		})
	}

	// Add regular deposits until retirement (only if amount > 0)
	const depositAmount =
		goalData.customDepositAmount ??
		calculateRequiredDeposit({
			retirementStart,
			retirementLength: goalData.retirementLength,
			desiredBudget: goalData.desiredBudget,
			budgetPeriod: goalData.budgetPeriod,
			currentSavings: goalData.currentSavings,
			apy: goalData.apy,
			inflation: goalData.inflation,
			depositStart,
			depositPeriod: goalData.depositPeriod,
		})

	if (depositAmount > 0) {
		transactions.push({
			investment_id: investmentId,
			amount: depositAmount,
			date: formatDate(depositStart),
			type: 'deposit',
			created_at: new Date().toISOString(),
			last_edited_at: new Date().toISOString(),
			end_date: formatDate(retirementStart),
			inflation_adjusted: true,
			label: labels.regularDeposit,
			repeat: 1,
			repeat_unit: goalData.depositPeriod === 'month' ? 'month' : 'year',
		})
	}

	// Add withdrawals during retirement (only if amount > 0)
	if (goalData.desiredBudget > 0) {
		const retirementEndDate = new Date(
			retirementStart.getFullYear() + goalData.retirementLength,
			retirementStart.getMonth(),
			retirementStart.getDate(),
		)

		transactions.push({
			investment_id: investmentId,
			amount: goalData.desiredBudget,
			date: formatDate(retirementStart),
			type: 'withdrawal',
			created_at: new Date().toISOString(),
			last_edited_at: new Date().toISOString(),
			end_date: formatDate(retirementEndDate),
			inflation_adjusted: true,
			label: labels.retirementWithdrawal,
			repeat: 1,
			repeat_unit: goalData.budgetPeriod === 'month' ? 'month' : 'year',
		})
	}

	return transactions
}
