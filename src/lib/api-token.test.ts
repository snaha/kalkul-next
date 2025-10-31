import { describe, it, expect } from 'vitest'
import {
	generateToken,
	hashToken,
	getTokenPrefix,
	isValidTokenFormat,
	constantTimeCompare,
} from './api-token'

describe('Token Utilities', () => {
	describe('generateToken', () => {
		it('should generate a token with correct prefix', () => {
			const token = generateToken()
			expect(token).toMatch(/^kalkul_/)
		})

		it('should generate tokens of sufficient length', () => {
			const token = generateToken()
			expect(token.length).toBeGreaterThan(40) // kalkul_ (7) + base64 (~43)
		})

		it('should generate unique tokens', () => {
			const token1 = generateToken()
			const token2 = generateToken()
			expect(token1).not.toBe(token2)
		})

		it('should use URL-safe base64 encoding', () => {
			const token = generateToken()
			// Should not contain +, /, or = characters
			expect(token).not.toMatch(/[+/=]/)
		})
	})

	describe('hashToken', () => {
		it('should produce a consistent hash for the same token', async () => {
			const token = 'kalkul_test123'
			const hash1 = await hashToken(token)
			const hash2 = await hashToken(token)
			expect(hash1).toBe(hash2)
		})

		it('should produce different hashes for different tokens', async () => {
			const token1 = 'kalkul_test123'
			const token2 = 'kalkul_test456'
			const hash1 = await hashToken(token1)
			const hash2 = await hashToken(token2)
			expect(hash1).not.toBe(hash2)
		})

		it('should produce a hex string of correct length (SHA-256)', async () => {
			const token = 'kalkul_test123'
			const hash = await hashToken(token)
			expect(hash).toMatch(/^[0-9a-f]{64}$/) // SHA-256 produces 64 hex chars
		})

		it('should produce the correct hash for the demo token', async () => {
			const token = 'kalkul_1234567890123456789012345678901234567890123'
			const hash = await hashToken(token)
			const expectedHash = '642bb919b51d5dd8974707b140fad6112b747c3a8870ab7eaa21641e4394ab64'
			expect(hash).toBe(expectedHash)
		})
	})

	describe('getTokenPrefix', () => {
		it('should return first 12 characters', () => {
			const token = 'kalkul_abcdefghijklmnop'
			const prefix = getTokenPrefix(token)
			expect(prefix).toBe('kalkul_abcde')
		})

		it('should handle short tokens', () => {
			const token = 'kalkul_'
			const prefix = getTokenPrefix(token)
			expect(prefix).toBe('kalkul_')
		})
	})

	describe('isValidTokenFormat', () => {
		it('should accept valid token format', () => {
			const token = generateToken()
			expect(isValidTokenFormat(token)).toBe(true)
		})

		it('should reject tokens without correct prefix', () => {
			const token = 'invalid_abc123'
			expect(isValidTokenFormat(token)).toBe(false)
		})

		it('should reject tokens that are too short', () => {
			const token = 'kalkul_short'
			expect(isValidTokenFormat(token)).toBe(false)
		})

		it('should accept tokens with valid length', () => {
			const token = 'kalkul_' + 'a'.repeat(43)
			expect(isValidTokenFormat(token)).toBe(true)
		})
	})

	describe('constantTimeCompare', () => {
		it('should return true for identical strings', () => {
			const str = 'kalkul_test123'
			expect(constantTimeCompare(str, str)).toBe(true)
		})

		it('should return false for different strings', () => {
			const str1 = 'kalkul_test123'
			const str2 = 'kalkul_test456'
			expect(constantTimeCompare(str1, str2)).toBe(false)
		})

		it('should return false for strings of different lengths', () => {
			const str1 = 'kalkul_test'
			const str2 = 'kalkul_test123'
			expect(constantTimeCompare(str1, str2)).toBe(false)
		})

		it('should handle empty strings', () => {
			expect(constantTimeCompare('', '')).toBe(true)
		})

		it('should be case-sensitive', () => {
			const str1 = 'kalkul_Test'
			const str2 = 'kalkul_test'
			expect(constantTimeCompare(str1, str2)).toBe(false)
		})
	})

	describe('Integration tests', () => {
		it('should generate, hash, and validate a complete token flow', async () => {
			// Generate a token
			const token = generateToken()

			// Validate format
			expect(isValidTokenFormat(token)).toBe(true)

			// Get prefix
			const prefix = getTokenPrefix(token)
			expect(prefix).toMatch(/^kalkul_/)

			// Hash token
			const hash = await hashToken(token)
			expect(hash).toMatch(/^[0-9a-f]{64}$/)

			// Verify hash consistency
			const hash2 = await hashToken(token)
			expect(constantTimeCompare(hash, hash2)).toBe(true)
		})
	})
})
