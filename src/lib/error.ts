import { json } from '@sveltejs/kit'

function unknownToString(value: unknown): string {
	try {
		return String(value)
	} catch {
		return 'unknown'
	}
}

export function jsonError(error: unknown, status: number = 400, context?: object) {
	const errorMessage = unknownToString(error)
	const errorJson = {
		error: errorMessage,
		context,
	}
	return json(errorJson, { status })
}
