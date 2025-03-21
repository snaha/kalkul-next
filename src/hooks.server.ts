import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import { json, type Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.url.pathname.startsWith('/api')) {
		const response = await resolve(event)
		return response
	}

	const auth = event.request.headers.get('Authorization')
	if (!auth) {
		return json('missing Authorization header', { status: 400 })
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
		return json('invalid auth token', { status: 400 })
	}
	const authUser = await supabase.auth.getUser(authToken)
	const {
		data: { user },
		error,
	} = authUser
	if (error || !user) {
		// JWT validation has failed
		return json('invalid auth user', { status: 400 })
	}

	event.locals.user = user

	const response = await resolve(event)
	return response
}
