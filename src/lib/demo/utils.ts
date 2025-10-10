export function notImplemented(locale: string | null | undefined) {
	const message = locale === 'cs' ? 'Zatím neimplementováno' : 'Not implemented yet'
	alert(message)
}
