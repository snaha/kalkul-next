import type { Transaction } from './types'
import {
	differenceInDays,
	differenceInMonths,
	differenceInWeeks,
	differenceInYears,
} from 'date-fns'

export function calculateTotalAmount(transactions: Transaction[], type: string) {
	return transactions
		.filter((transaction) => transaction.type === type)
		.reduce((prev, transaction) => {
			const periods = calculateNumOccurrences(transaction)

			return prev + transaction.amount * periods
		}, 0)
}

export function calculateNumOccurrences({
	date,
	end_date,
	repeat_unit,
	repeat,
}: Omit<Transaction, 'amount' | 'type'>): number {
	if (typeof end_date !== 'string') return 1
	if (!repeat_unit || !repeat) {
		throw new Error('invalidTransactionInput')
	}

	const startDate = new Date(date)
	const endDate = new Date(end_date)

	switch (repeat_unit) {
		case 'day':
			return (differenceInDays(endDate, startDate) + 1) / repeat
		case 'week':
			return (differenceInWeeks(endDate, startDate) + 1) / repeat
		case 'month':
			return (differenceInMonths(endDate, startDate) + 1) / repeat
		case 'year':
			return (differenceInYears(endDate, startDate) + 1) / repeat
		default:
			throw new Error('invalidTransactionRepeatUnit')
	}
}
