import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { CORS_ALLOWED_ORIGIN } from '$env/static/private'
import { apiRoutes } from '$lib/routes'
import { createServerClient } from '@supabase/ssr'
import { json, type Handle } from '@sveltejs/kit'

const headers =
	typeof CORS_ALLOWED_ORIGIN === 'string' && CORS_ALLOWED_ORIGIN !== ''
		? { 'Access-Control-Allow-Origin': CORS_ALLOWED_ORIGIN }
		: undefined

export const handle: Handle = async ({ event, resolve }) => {
	// For non-API routes
	if (!event.url.pathname.startsWith(apiRoutes.ROOT)) {
		const response = await resolve(event)
		return response
	}

	// API routes OPTIONS handling add cors headers
	if (
		typeof CORS_ALLOWED_ORIGIN === 'string' &&
		CORS_ALLOWED_ORIGIN !== '' &&
		event.url.pathname.startsWith(apiRoutes.ROOT) &&
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

	if (event.url.pathname !== apiRoutes.NEWSLETTER_SUBSCRIBE) {
		// For API routes, enforce Authorization header
		const auth = event.request.headers.get('Authorization')
		if (!auth) {
			return json('missing Authorization header', {
				status: 400,
				headers,
			})
		}

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

		const [, authToken] = auth.split(' ')
		if (!authToken) {
			return json('invalid auth token', {
				status: 400,
				headers,
			})
		}

		const authUser = await supabase.auth.getUser(authToken)
		const {
			data: { user },
			error,
		} = authUser
		if (error || !user) {
			return json('invalid auth user', {
				status: 400,
				headers,
			})
		}

		event.locals.user = user
	}

	// Resolve API routes and append CORS headers
	const response = await resolve(event)
	if (typeof CORS_ALLOWED_ORIGIN === 'string' && CORS_ALLOWED_ORIGIN !== '') {
		response.headers.append('Access-Control-Allow-Origin', CORS_ALLOWED_ORIGIN)
	}
	return response
}
