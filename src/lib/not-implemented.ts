export function notImplemented(e?: Event, message?: string) {
	e?.preventDefault()
	e?.stopPropagation()
	if (message) {
		alert(message)
	} else {
		alert('Not implemented!')
	}
}
