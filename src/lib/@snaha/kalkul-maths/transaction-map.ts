import { formatDate, incrementDate } from './date'
import type { Transaction, TransactionMap } from './types'

export function createTransactionMap(transactions: Omit<Transaction, 'type'>[]): TransactionMap {
	const map: TransactionMap = new Map()

	transactions.forEach((transaction) => {
		addTransaction(map, transaction)
	})

	return map
}

export function addSingleEvent(map: TransactionMap, date: string, amount: number): void {
	const dateString = date
	const existingTransaction = map.get(dateString) ?? 0
	map.set(dateString, existingTransaction + amount)
}

export function addTransaction(map: TransactionMap, transaction: Omit<Transaction, 'type'>): void {
	if (typeof transaction.repeat !== 'number') {
		addSingleEvent(map, formatDate(new Date(transaction.date)), transaction.amount)
	} else if (
		typeof transaction.repeat_unit === 'string' &&
		typeof transaction.repeat === 'number' &&
		typeof transaction.end_date === 'string'
	) {
		for (
			let date = new Date(transaction.date);
			date <= new Date(transaction.end_date);
			date = incrementDate(date, transaction.repeat_unit, transaction.repeat)
		) {
			addSingleEvent(map, formatDate(date), transaction.amount)
		}
	}
}
