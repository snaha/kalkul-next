import { json } from '@sveltejs/kit'
import { jsonError } from '$lib/error'
import { generateToken, hashToken, getTokenPrefix } from '$lib/api-token'
import { serviceAdapter } from '$lib/adapters/service' // Use serviceAdapter

/**
 * GET /api/user/tokens
 * Lists all API tokens for the authenticated user
 */
export async function GET({ locals }) {
	try {
		const user = locals.user
		if (!user?.id) {
			return jsonError('Unauthorized', { status: 401 })
		}

		// Fetch user's tokens from database using adapter
		const apiTokens = await serviceAdapter.getApiTokens(user.id)

		return json(apiTokens)
	} catch (error) {
		console.error(error)
		return jsonError('Failed to list tokens', { status: 500, cause: error })
	}
}

/**
 * POST /api/user/tokens
 * Creates a new API token for the authenticated user
 *
 * Request body:
 * {
 *   "name": "My API Token"
 * }
 *
 * Response:
 * {
 *   "id": "uuid",
 *   "token": "kalkul_...",  // Full token shown only once!
 *   "token_prefix": "kalkul_Abc12",
 *   "name": "My API Token",
 *   "created_at": "2025-10-29T...",
 *   "is_active": true
 * }
 */
export async function POST({ request, locals }) {
	try {
		const user = locals.user
		if (!user?.id) {
			return jsonError('Unauthorized', { status: 401 })
		}

		// Parse request body
		const body = await request.json()
		const name = body.name

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return jsonError('Token name is required', { status: 400 })
		}

		if (name.length > 100) {
			return jsonError('Token name must be less than 100 characters', { status: 400 })
		}

		// Generate token
		const token = generateToken()
		const tokenHash = await hashToken(token)
		const tokenPrefix = getTokenPrefix(token)

		// Store token hash in database using adapter
		const apiToken = await serviceAdapter.createApiToken(
			user.id,
			tokenHash,
			tokenPrefix,
			name.trim(),
		)

		// Return full token (only time it will be shown!)
		return json({
			...apiToken,
			token, // Include full token in response
		})
	} catch (error) {
		console.error(error)
		return jsonError('Failed to create token', { status: 500, cause: error })
	}
}
