import type { User } from '@supabase/supabase-js'
import type { TypedUserMetadata } from './types'

/**
 * Feature flags for controlling progressive rollout of new features
 */

/**
 * Check if the Goals feature is enabled for a user
 * @param user - User object from Supabase Auth
 * @returns true if goals feature is enabled for this user
 */
export function isGoalsEnabledForUser(user: User | undefined): boolean {
	if (!user) return false

	const metadata = user.user_metadata as TypedUserMetadata
	return metadata?.goals_enabled === true
}
