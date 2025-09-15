export function capitalizeFirstLetter(s: string) {
	if (s.length === 0) {
		return s
	}
	return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatAge(birthDate: Date, currentDate = new Date()): string {
	// Extract year, month, and day components
	const birthYear = birthDate.getFullYear()
	const birthMonth = (birthDate.getMonth() + 1).toFixed().padStart(2, '0')
	const birthDay = birthDate.getDate().toFixed().padStart(2, '0')

	const currentMonth = (currentDate.getMonth() + 1).toFixed().padStart(2, '0')
	const currentDay = currentDate.getDate().toFixed().padStart(2, '0')
	const compareDayOfMonth = `${currentMonth}${currentDay}`.localeCompare(`${birthMonth}${birthDay}`)

	const age = currentDate.getFullYear() - birthYear - (compareDayOfMonth === -1 ? 1 : 0)
	return age.toFixed()
}

export function formatCurrency(
	value: number | bigint,
	currency: string,
	locale: string | null | undefined,
	options?: Intl.NumberFormatOptions,
) {
	const intl = new Intl.NumberFormat(locale || undefined, {
		currencyDisplay: 'code',
		maximumFractionDigits: 0,
		...options,
	})
	return `${intl.format(value)} ${currency}`
}

export function formatNumber(
	value: number,
	locale: string | null | undefined,
	options?: Intl.NumberFormatOptions,
) {
	const intl = new Intl.NumberFormat(locale || undefined, {
		style: 'decimal',
		...options,
	})
	return intl.format(value)
}

export function parseLocalizedNumber(value: string, locale: string | null | undefined): number {
	// Get the thousand separator for the locale
	const formatter = new Intl.NumberFormat(locale || undefined)
	const parts = formatter.formatToParts(1234.5)
	const groupSeparator = parts.find((part) => part.type === 'group')?.value || ','

	// Remove all thousand separators
	let normalized = value.replace(new RegExp(`\\${groupSeparator}`, 'g'), '')

	// Handle both . and , as decimal separators intelligently
	// If there's only one decimal separator (either . or ,), treat it as decimal
	const dotCount = (normalized.match(/\./g) || []).length
	const commaCount = (normalized.match(/,/g) || []).length

	if (dotCount === 1 && commaCount === 0) {
		// Only dots, keep as is
	} else if (commaCount === 1 && dotCount === 0) {
		// Only comma, convert to dot
		normalized = normalized.replace(',', '.')
	} else if (dotCount > 1 || commaCount > 1 || (dotCount > 0 && commaCount > 0)) {
		// Multiple separators or mixed - invalid, return 0
		return 0
	}

	return parseFloat(normalized) || 0
}

export const asyncTimeout = (ms: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}
