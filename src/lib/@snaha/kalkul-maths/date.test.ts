import { describe, expect, it } from 'vitest'
import { formatDate, incrementDate } from './date'

describe('#formatDate', () => {
	it('should correctly format a date to yyyy-MM-dd', () => {
		const date = new Date(2025, 2, 17)
		expect(formatDate(date)).toBe('2025-03-17')
	})
})

describe('#incrementDate', () => {
	it('should correctly increment a date by days', () => {
		const date = new Date(2025, 2, 17)
		expect(formatDate(incrementDate(date, 'day', 5))).toBe('2025-03-22')
	})

	it('should correctly increment a date by weeks', () => {
		const date = new Date(2025, 2, 17)
		expect(formatDate(incrementDate(date, 'week', 2))).toBe('2025-03-31')
	})

	it('should correctly increment a date by months', () => {
		const date = new Date(2025, 2, 17)
		expect(formatDate(incrementDate(date, 'month', 3))).toBe('2025-06-17')
	})

	it('should correctly increment a date by years', () => {
		const date = new Date(2025, 2, 17)
		expect(formatDate(incrementDate(date, 'year', 1))).toBe('2026-03-17')
	})
})
