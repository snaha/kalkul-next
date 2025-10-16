import { browser } from '$app/environment'

// Umami event constants
export const UMAMI_EVENTS = {
	// Signup flow
	SIGNUP_BUTTON: 'signup-button',

	// Moneyfest landing page
	MONEYFEST_BUTTON: 'moneyfest-button',
	MONEYFEST_WHAT_IS_KALKUL: 'moneyfest-what-is-kalkul',

	// Get started guide
	GET_STARTED_OPEN_APP: 'get-started-open-app',
	GET_STARTED_JOIN_DISCORD: 'get-started-join-discord',
	GET_STARTED_FAQ_WHAT_IS_KALKUL: 'get-started-faq-what-is-kalkul',
	GET_STARTED_FAQ_IS_KALKUL_FREE: 'get-started-faq-is-kalkul-free',
	GET_STARTED_FAQ_WHY_DISCORD: 'get-started-faq-why-discord',

	// Landing page
	LANDING_GET_STARTED: 'landing-get-started',
	LANDING_SAMPLE_PORTFOLIO: 'landing-sample-portfolio',
	LANDING_REQUEST_DEMO: 'landing-request-demo',

	// Header
	HEADER_HELP: 'header-help',

	// Help box
	HELP_BOX_GET_STARTED: 'help-box-get-started',
	HELP_BOX_VIEW_PORTFOLIO: 'help-box-view-portfolio',
	HELP_BOX_WATCH_VIDEO: 'help-box-watch-video',
} as const

// Extract the union type of all event values
export type UmamiEventName = (typeof UMAMI_EVENTS)[keyof typeof UMAMI_EVENTS]

export interface Umami {
	track(event_name: UmamiEventName, data?: object): void
	track(payload: object): void
	identity(unique_id: string, data?: object): void
	identity(data: object): void
}

export const umami: Umami | undefined = browser ? window.umami : undefined
