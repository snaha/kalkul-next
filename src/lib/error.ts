import { json } from '@sveltejs/kit'

// This matches semantically the Javascript Error object interface
type ErrorJSON = {
	error: string
	cause?: unknown
}

type JSONErrorOptions = ResponseInit & {
	cause: unknown
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

export function jsonError(message: string, options?: Partial<JSONErrorOptions>) {
	const status = options?.status ?? 400
	const statusText = options?.statusText
	const headers = options?.headers
	const cause = unknownToObject(options?.cause)
	const errorJson: ErrorJSON = {
		error: message,
		cause,
	}
	console.error({ errorJson, status, statusText, headers })
	return json(errorJson, { status, statusText, headers })
}
