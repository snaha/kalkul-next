import { STRIPE_API_KEY } from '$env/static/private'
import Stripe from 'stripe'
import type { StripeSubscription } from '$lib/types'

export const stripe = new Stripe(STRIPE_API_KEY)

/**
 * Check if a subscription needs refresh (close to expiry or status uncertain)
 */
export function needsRefresh(subscription: StripeSubscription): boolean {
	const now = new Date()
	const periodEnd = new Date(subscription.current_period_end)
	const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

	// Refresh if within 1 hour of billing period end
	if (periodEnd <= oneHourFromNow) {
		return true
	}

	// Refresh if we have a trial that's ending soon or has ended
	if (subscription.trial_end) {
		const trialEnd = new Date(subscription.trial_end)

		// If trial has ended but status is still 'trialing', definitely refresh
		if (now >= trialEnd && subscription.status === 'trialing') {
			return true
		}

		// If trial ends within 1 hour, refresh to catch status change
		if (trialEnd <= oneHourFromNow) {
			return true
		}
	}

	// Refresh if status indicates potential issues
	if (!['active', 'trialing'].includes(subscription.status)) {
		return true
	}

	return false
}
