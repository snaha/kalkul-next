/**
 * Feature flags for controlling progressive rollout of new features
 */

/**
 * List of user emails that have the Goals feature enabled
 * - Empty array: feature is disabled for everyone
 * - Array with emails: feature is enabled only for those emails
 * - To enable for all users: remove this feature flag check entirely from the code
 */
export const GOALS_ENABLED_FOR_EMAILS: string[] = [
	'goals@kalkul.app', // Goals account (advisor user) with goals feature enabled
]

/**
 * Check if the Goals feature is enabled for a given email
 * @param email - User email to check
 * @returns true if goals feature is enabled for this email
 */
export function isGoalsEnabledForEmail(email: string | undefined): boolean {
	if (!email) return false
	return GOALS_ENABLED_FOR_EMAILS.includes(email)
}
