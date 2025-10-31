import { json } from '@sveltejs/kit'
import { jsonError } from '$lib/error'
import { serviceAdapter } from '$lib/adapters/service'

/**
 * DELETE /api/user/tokens/[id]
 * Revokes (deletes) an API token
 */
export async function DELETE({ params, locals }) {
	try {
		const user = locals.user
		if (!user?.id) {
			return jsonError('Unauthorized', { status: 401 })
		}

		const tokenId = params.id

		if (!tokenId) {
			return jsonError('Token ID is required', { status: 400 })
		}

		// Delete token using adapter
		await serviceAdapter.deleteApiToken(tokenId, user.id)

		return json({ success: true })
	} catch (error) {
		console.error(error)
		return jsonError('Failed to revoke token', { status: 500, cause: error })
	}
}

/**
 * PATCH /api/user/tokens/[id]
 * Updates an API token's name or active status
 *
 * Request body:
 * {
 *   "name"?: "New Name",
 *   "is_active"?: false
 * }
 */
export async function PATCH({ params, request, locals }) {
	try {
		const user = locals.user
		if (!user?.id) {
			return jsonError('Unauthorized', { status: 401 })
		}

		const tokenId = params.id

		if (!tokenId) {
			return jsonError('Token ID is required', { status: 400 })
		}

		// Parse request body
		const body = await request.json()
		const updates: { name?: string; is_active?: boolean } = {}

		if ('name' in body) {
			if (typeof body.name !== 'string' || body.name.trim().length === 0) {
				return jsonError('Token name must be a non-empty string', { status: 400 })
			}
			if (body.name.length > 100) {
				return jsonError('Token name must be less than 100 characters', { status: 400 })
			}
			updates.name = body.name.trim()
		}

		if ('is_active' in body) {
			if (typeof body.is_active !== 'boolean') {
				return jsonError('is_active must be a boolean', { status: 400 })
			}
			updates.is_active = body.is_active
		}

		if (Object.keys(updates).length === 0) {
			return jsonError('No valid fields to update', { status: 400 })
		}

		// Update token using adapter
		const apiToken = await serviceAdapter.updateApiToken(tokenId, user.id, updates)

		return json(apiToken)
	} catch (error) {
		console.error(error)
		return jsonError('Failed to update token', { status: 500, cause: error })
	}
}
