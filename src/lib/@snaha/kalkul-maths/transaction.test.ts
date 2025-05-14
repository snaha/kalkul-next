import { describe, it, expect } from 'vitest'
import { calculateTotalAmount, calculateNumOccurrences } from './transaction'
import type { Transaction, TransactionType } from './types'

const baseTransaction: Omit<Transaction, 'end_date' | 'repeat' | 'repeat_unit'> = {
	amount: 100,
	type: 'deposit',
	date: '2024-01-01',
} as const

describe('#calculateNumOccurrences', () => {
	it('should return 1 if end_date is not provided', () => {
		const result = calculateNumOccurrences(baseTransaction)
		expect(result).toBe(1)
	})

	it('should calculate correct number of daily repetitions', () => {
		const result = calculateNumOccurrences({
			...baseTransaction,
			end_date: '2024-01-10',
			repeat_unit: 'day',
			repeat: 1,
		})
		expect(result).toBe(10)
	})

	it('should calculate weekly repetitions correctly', () => {
		const result = calculateNumOccurrences({
			...baseTransaction,
			end_date: '2024-02-01',
			repeat_unit: 'week',
			repeat: 1,
		})
		expect(result).toBe(5)
	})

	it('should calculate monthly repetitions correctly', () => {
		const result = calculateNumOccurrences({
			...baseTransaction,
			end_date: '2024-04-01',
			repeat_unit: 'month',
			repeat: 1,
		})
		expect(result).toBe(4)
	})

	it('should calculate yearly repetitions correctly', () => {
		const result = calculateNumOccurrences({
			...baseTransaction,
			end_date: '2026-01-01',
			repeat_unit: 'year',
			repeat: 1,
		})
		expect(result).toBe(3)
	})

	it('should throw on missing repeat or repeat_unit', () => {
		expect(() =>
			calculateNumOccurrences({
				...baseTransaction,
				end_date: '2024-02-01',
			}),
		).toThrow('invalidTransactionInput')
	})

	it('should throw on invalid repeat unit', () => {
		expect(() =>
			calculateNumOccurrences({
				...baseTransaction,
				end_date: '2024-02-01',
				repeat_unit: 'invalid_unit',
				repeat: 1,
			} as unknown as Transaction),
		).toThrow('invalidTransactionRepeatUnit')
	})
})

describe('#calculateTotalAmount', () => {
	it('should return 0 if there are no matching transactions', () => {
		const transactions: Transaction[] = [{ ...baseTransaction, type: 'withdrawal', amount: 50 }]
		expect(calculateTotalAmount(transactions, 'deposit')).toBe(0)
	})

	it('should sum single non-repeating transaction', () => {
		const transactions: Transaction[] = [{ ...baseTransaction, amount: 200 }]
		expect(calculateTotalAmount(transactions, 'deposit' as TransactionType)).toBe(200)
	})

	it('should sum repeating daily transaction', () => {
		const transactions: Transaction[] = [
			{
				...baseTransaction,
				amount: 10,
				end_date: '2024-01-05',
				repeat_unit: 'day',
				repeat: 1,
				type: 'deposit',
			},
		]
		// 5 days × 10 = 50
		expect(calculateTotalAmount(transactions, 'deposit')).toBe(50)
	})

	it('should sum mixed repeating and non-repeating', () => {
		const transactions: Transaction[] = [
			{ ...baseTransaction, amount: 100 },
			{
				...baseTransaction,
				amount: 10,
				end_date: '2024-01-03',
				repeat_unit: 'day',
				repeat: 1,
			},
		]
		// 100 + (3 * 10)
		expect(calculateTotalAmount(transactions, 'deposit')).toBe(130)
	})
})
