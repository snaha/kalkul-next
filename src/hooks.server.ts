import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { CORS_ALLOWED_ORIGIN } from '$env/static/private'
import { apiRoutes } from '$lib/routes'
import { createServerClient } from '@supabase/ssr'
import { json, type Handle } from '@sveltejs/kit'
import { jsonError } from '$lib/error'
import { hashToken, isValidTokenFormat, constantTimeCompare } from '$lib/api-token'
import { serviceAdapter } from '$lib/adapters/service'

const headers =
	typeof CORS_ALLOWED_ORIGIN === 'string' && CORS_ALLOWED_ORIGIN !== ''
		? { 'Access-Control-Allow-Origin': CORS_ALLOWED_ORIGIN }
		: undefined

export const handle: Handle = async ({ event, resolve }) => {
	// Redirect www to non-www domain
	if (event.url.hostname.startsWith('www.')) {
		const nonWwwUrl = new URL(event.url)
		nonWwwUrl.hostname = nonWwwUrl.hostname.substring(4)
		return new Response(null, {
			status: 301,
			headers: {
				Location: nonWwwUrl.toString(),
			},
		})
	}

	const { pathname } = event.url
	// Handle OAuth discovery endpoints for authless mode
	if (pathname.startsWith('/.well-known/oauth-protected-resource')) {
		return json({
			resource: `${event.url.origin}${apiRoutes.MCP}`,
			authorization_servers: [],
			bearer_methods_supported: [],
		})
	}

	if (pathname.startsWith('/.well-known/oauth-authorization-server')) {
		return new Response(null, { status: 204 })
	}

	// Handle the /register endpoint that Claude tries
	if (pathname === '/register') {
		return new Response(null, { status: 204 })
	}

	// For non-API routes (check for /api/ with trailing slash to avoid matching /api-tokens)
	if (!event.url.pathname.startsWith(`${apiRoutes.ROOT}/`)) {
		const response = await resolve(event)
		return response
	}

	// API routes OPTIONS handling add cors headers
	if (
		typeof CORS_ALLOWED_ORIGIN === 'string' &&
		CORS_ALLOWED_ORIGIN !== '' &&
		event.url.pathname.startsWith(`${apiRoutes.ROOT}/`) &&
		event.request.method === 'OPTIONS'
	) {
		return new Response(null, {
			status: 204,
			headers: {
				...headers,
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
				'Access-Control-Allow-Headers': '*',
			},
		})
	}

	// Skip auth for specific routes that don't require authentication
	const isPublicRoute =
		event.url.pathname === apiRoutes.NEWSLETTER_SUBSCRIBE ||
		event.url.pathname.startsWith(apiRoutes.EMAIL)

	if (!isPublicRoute) {
		// Extract authentication token from multiple sources:
		// 1. Authorization header: "Bearer kalkul_xxx" or "Bearer jwt_xxx"
		// 2. X-API-Key header: "kalkul_xxx"
		// 3. Query parameter: ?token=kalkul_xxx (for web integrations like Claude on the web)

		let authToken: string | undefined = undefined

		// Try Authorization header first
		const auth = event.request.headers.get('Authorization')
		if (auth) {
			const [, token] = auth.split(' ')
			authToken = token
		}

		// Try X-API-Key header
		if (!authToken) {
			const apiKey = event.request.headers.get('X-API-Key')
			if (apiKey) {
				authToken = apiKey
			}
		}

		// Try query parameter (for web integrations)
		if (!authToken) {
			const tokenParam = event.url.searchParams.get('token')
			if (tokenParam) {
				authToken = tokenParam
			}
		}

		if (!authToken) {
			return jsonError(
				'Missing authentication. Provide token via Authorization header, X-API-Key header, or ?token query parameter',
				{ status: 401 },
			)
		}

		// Check if this is an API Token
		if (isValidTokenFormat(authToken)) {
			try {
				// Hash the token for database lookup
				const tokenHash = await hashToken(authToken)

				// Find the token in the database
				const apiTokens = await serviceAdapter.getApiToken(tokenHash)

				if (!apiTokens || !apiTokens.is_active) {
					return jsonError('invalid api token', {
						status: 401,
						headers,
					})
				}
				const tokenData = apiTokens

				// Verify token hash with constant-time comparison (defense in depth)
				if (!constantTimeCompare(tokenHash, tokenData.token_hash)) {
					return jsonError('invalid api token', {
						status: 401,
						headers,
					})
				}

				// Get user from user_id
				const { data: userData, error: userError } = await serviceAdapter.adminGetUserById(
					tokenData.user_id,
				)

				if (userError || !userData?.user) {
					return jsonError('invalid user for token', {
						status: 401,
						headers,
					})
				}

				// Update last_used_at timestamp (non-blocking)
				await serviceAdapter.updateApiToken(tokenData.id, tokenData.user_id, {
					last_used_at: new Date().toISOString(),
				}) // Assuming updateApiToken can update last_used_at

				event.locals.user = userData.user
			} catch (error) {
				console.error('API token authentication error:', error)
				return jsonError('authentication failed', {
					status: 500,
					headers,
				})
			}
		} else {
			// Standard Supabase JWT authentication
			const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				cookies: {
					getAll: () => event.cookies.getAll(),
					/**
					 * SvelteKit's cookies API requires `path` to be explicitly set in
					 * the cookie options. Setting `path` to `/` replicates previous/
					 * standard behavior.
					 */
					setAll: (cookiesToSet) => {
						cookiesToSet.forEach(({ name, value, options }) => {
							event.cookies.set(name, value, { ...options, path: '/' })
						})
					},
				},
			})

			const authUser = await supabase.auth.getUser(authToken)
			const {
				data: { user },
				error,
			} = authUser
			if (error || !user) {
				return jsonError('invalid auth user', {
					status: 400,
					headers,
				})
			}

			event.locals.user = user
		}
	}

	// Resolve API routes and append CORS headers
	const response = await resolve(event)
	if (typeof CORS_ALLOWED_ORIGIN === 'string' && CORS_ALLOWED_ORIGIN !== '') {
		response.headers.append('Access-Control-Allow-Origin', CORS_ALLOWED_ORIGIN)
	}
	return response
}
