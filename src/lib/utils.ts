export function capitalizeFirstLetter(s: string) {
	if (s.length === 0) {
		return s
	}
	return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatDate(date: Date): string {
	// Extract year, month, and day components
	const year = date.getFullYear().toFixed()
	const month = (date.getMonth() + 1).toFixed().padStart(2, '0')
	const day = date.getDate().toFixed().padStart(2, '0')

	// Format the date components into "yyyy-MM-dd" format
	return `${year}-${month}-${day}`
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

export function formatCurrency(value: number | bigint, currency: string) {
	// detect locale automatically
	const locale = undefined
	const intl = new Intl.NumberFormat(locale, {
		currencyDisplay: 'code',
		maximumFractionDigits: 2,
	})
	return `${intl.format(value)} ${currency}`
}
