import { json } from '@sveltejs/kit'

// This matches semantically the Javascript Error object interface
type ErrorJSON = {
	error: string
	cause?: unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unknownToObject(value: unknown | undefined): any {
	try {
		if (typeof value === 'undefined') {
			return undefined
		}

		// Check if value can be json serialized
		JSON.stringify(value)
		return value
	} catch {
		return 'unknown'
	}
}

export function jsonError(message: string, options?: { status?: number; cause?: unknown }) {
	const status = options?.status ?? 400
	const cause = unknownToObject(options?.cause)
	const errorJson: ErrorJSON = {
		error: message,
		cause,
	}
	console.error({ errorJson, status })
	return json(errorJson, { status })
}
