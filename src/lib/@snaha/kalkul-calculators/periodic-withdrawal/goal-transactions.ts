import type { PeriodicWithdrawalGoalData, Transaction } from '$lib/types'
import { formatDate } from '$lib/@snaha/kalkul-maths'
import { calculateRequiredDeposit, goalDataToCalculationInput } from './periodic-withdrawal'

type TransactionLabels = {
  initialSavings: string
  regularDeposit: string
  withdrawal: string
}

/**
 * Converts periodic withdrawal goal data (retirement or education) into a series of transaction records.
 *
 * Generates up to 3 transactions based on the goal:
 * 1. **Initial deposit** - One-time deposit of current savings at deposit start (if > 0)
 * 2. **Regular deposits** - Recurring deposits from deposit start until withdrawal start (if > 0)
 * 3. **Regular withdrawals** - Recurring withdrawals during the withdrawal period (if > 0)
 *
 * If no custom deposit amount is provided, it automatically calculates the required
 * deposit amount needed to reach the goal.
 *
 * @param goalData - Goal parameters including dates, amounts, and frequencies
 * @param investmentId - The investment ID to associate with the transactions
 * @param labels - Localized labels for the three transaction types
 * @returns Array of transaction objects (without IDs) ready to be inserted into the database
 * @example
 * // Returns array with 3 transactions: initial, deposits, withdrawals
 * goalToTransactions(
 *   goalData,
 *   123,
 *   { initialSavings: 'Initial', regularDeposit: 'Monthly', withdrawal: 'Budget' }
 * )
 */
export function goalToTransactions(
  goalData: PeriodicWithdrawalGoalData,
  investmentId: string,
  labels: TransactionLabels,
): Omit<Transaction, 'id'>[] {
  const transactions: Omit<Transaction, 'id'>[] = []

  // Convert goal data to calculation input
  const calculationInput = goalDataToCalculationInput(goalData)
  const depositStart = calculationInput.depositStart
  const withdrawalStart = calculationInput.withdrawalStart

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

  // Add regular deposits until withdrawal phase (only if amount > 0)
  const depositAmount = goalData.customDepositAmount ?? calculateRequiredDeposit(calculationInput)

  if (depositAmount > 0) {
    transactions.push({
      investment_id: investmentId,
      amount: depositAmount,
      date: formatDate(depositStart),
      type: 'deposit',
      created_at: new Date().toISOString(),
      last_edited_at: new Date().toISOString(),
      end_date: formatDate(withdrawalStart),
      inflation_adjusted: true,
      label: labels.regularDeposit,
      repeat: 1,
      repeat_unit: goalData.depositPeriod === 'month' ? 'month' : 'year',
    })
  }

  // Add withdrawals during withdrawal phase (only if amount > 0)
  if (goalData.desiredBudget > 0) {
    const withdrawalEndDate = new Date(
      withdrawalStart.getFullYear() + goalData.withdrawalDuration,
      withdrawalStart.getMonth(),
      withdrawalStart.getDate(),
    )

    transactions.push({
      investment_id: investmentId,
      amount: goalData.desiredBudget,
      date: formatDate(withdrawalStart),
      type: 'withdrawal',
      created_at: new Date().toISOString(),
      last_edited_at: new Date().toISOString(),
      end_date: formatDate(withdrawalEndDate),
      inflation_adjusted: true,
      label: labels.withdrawal,
      repeat: 1,
      repeat_unit: goalData.budgetPeriod === 'month' ? 'month' : 'year',
    })
  }

  return transactions
}
