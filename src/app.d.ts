// See https://kit.svelte.dev/docs/types#app

import type { User } from '@supabase/supabase-js'
import type { Umami } from '$lib/umami-events'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		umami?: Umami
	}
}

export {}
