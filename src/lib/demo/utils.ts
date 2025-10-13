// Demo client constants (matches seed.sql database values)
export const DEMO_CLIENT_NAME = 'Inflation Demo Client'
export const DEMO_CLIENT_BIRTH_DATE = '1980-02-02'
export const DEMO_CLIENT_EMAIL = 'demo@example.com'

export function notImplemented(locale: string | null | undefined) {
	const message = locale === 'cs' ? 'Zatím neimplementováno' : 'Not implemented yet'
	alert(message)
}
