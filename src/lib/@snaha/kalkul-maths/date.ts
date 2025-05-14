import type { Period } from './types'
import { addDays, addMonths, addWeeks, addYears, formatDate as dfnsFormatDate } from 'date-fns'

export function formatDate(date: Date): string {
	return dfnsFormatDate(date, 'yyyy-MM-dd')
}

export function incrementDate(date: Date, period: Period, count = 1) {
	switch (period) {
		case 'day':
			return addDays(date, count)
		case 'week':
			return addWeeks(date, count)
		case 'month':
			return addMonths(date, count)
		case 'year':
			return addYears(date, count)
	}
}
