/**
 * Token prefix for Kalkul API Tokens
 */
const TOKEN_PREFIX = 'kalkul_'

/**
 * Token length in bytes (will be base64 encoded, resulting in ~43 chars)
 */
const TOKEN_BYTES = 32

/**
 * Generates a cryptographically secure API Token
 * Format: kalkul_<base64_random_bytes>
 *
 * @returns The full token string (e.g., "kalkul_Abc123...")
 */
export function generateToken(): string {
	const bytes = new Uint8Array(TOKEN_BYTES)
	crypto.getRandomValues(bytes)

	// Convert to base64url (URL-safe base64 without padding)
	const base64 = Buffer.from(bytes)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '')

	return `${TOKEN_PREFIX}${base64}`
}

/**
 * Hashes a token using SHA-256
 * This hash is stored in the database for secure comparison
 *
 * @param token - The full token string to hash
 * @returns The SHA-256 hash as a hex string
 */
export async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(token)
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
	return hashHex
}

/**
 * Extracts the token prefix for display purposes
 * Shows only the first 12 characters (kalkul_ + first 5 chars of the token)
 *
 * @param token - The full token string
 * @returns The token prefix for UI display (e.g., "kalkul_Abc12")
 */
export function getTokenPrefix(token: string): string {
	return token.slice(0, 12)
}

/**
 * Verifies that a token matches the expected format
 *
 * @param token - The token to validate
 * @returns true if the token has the correct format
 */
export function isValidTokenFormat(token: string): boolean {
	// Token should be: kalkul_ + 43 base64url characters
	const expectedLength = TOKEN_PREFIX.length + Math.ceil((TOKEN_BYTES * 4) / 3)
	return token.startsWith(TOKEN_PREFIX) && token.length >= expectedLength - 2 // Allow -2 for base64 padding variations
}

/**
 * Performs constant-time comparison of two strings
 * This prevents timing attacks when comparing tokens
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
export function constantTimeCompare(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false
	}

	let result = 0
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i)
	}

	return result === 0
}
