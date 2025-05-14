import { describe, expect, it } from 'vitest'
import { createTransactionMap, addTransaction, addSingleEvent } from './transaction-map'
import type { Transaction } from './types'

describe('#createTransactionMap', () => {
	it('should return an empty map when given no transactions', () => {
		const result = createTransactionMap([])
		expect(result.size).toBe(0)
	})

	it('should correctly store a single transaction', () => {
		const transactions: Omit<Transaction, 'type'>[] = [
			{ date: '2025-03-17', amount: 100, repeat: null, repeat_unit: null, end_date: null },
		]
		const result = createTransactionMap(transactions)
		expect(result.get('2025-03-17')).toBe(100)
	})
})

describe('#addTransaction', () => {
	it('should add a single transaction to the map', () => {
		const map = new Map()
		const transaction: Omit<Transaction, 'type'> = {
			date: '2025-03-17',
			amount: 50,
			repeat: null,
			repeat_unit: null,
			end_date: null,
		}
		addTransaction(map, transaction)
		expect(map.get('2025-03-17')).toBe(50)
	})
})

describe('#addSingleEvent', () => {
	it('should correctly add an event to an empty map', () => {
		const map = new Map()
		addSingleEvent(map, '2025-03-17', 25)
		expect(map.get('2025-03-17')).toBe(25)
	})

	it('should correctly sum amounts for the same date', () => {
		const map = new Map()
		addSingleEvent(map, '2025-03-17', 25)
		addSingleEvent(map, '2025-03-17', 75)
		expect(map.get('2025-03-17')).toBe(100)
	})
})
