import { base } from '$app/paths'
const ROUTER = import.meta.env.VITE_ROUTER
const API_URL = import.meta.env.VITE_API_URL ?? ''

const routePrefix = `${base}${ROUTER === 'hash' ? '/#' : ''}`
const routeApiPrefix = API_URL

export default {
	HOME: `${routePrefix}/`,
	FORGOT_PASSWORD: `${routePrefix}/forgot-password`,
	SIGNUP: `${routePrefix}/signup`,
	LOGIN: `${routePrefix}/login`,
	ACCOUNT: `${routePrefix}/account`,
	ACCOUNT_CHANGE_EMAIL: `${routePrefix}/account/change-email`,
	ACCOUNT_CHANGE_PASSWORD: `${routePrefix}/account/change-password`,
	API_TOKENS: `${routePrefix}/api-tokens`,
	DEPOSIT: (index?: number) => `${routePrefix}/deposit${index === undefined ? '' : `/${index}`}`,
	WITHDRAWAL: (index?: number) =>
		`${routePrefix}/withdrawal${index === undefined ? '' : `/${index}`}`,
	NEW_CLIENT: `${routePrefix}/client/new`,
	CLIENT: (id: string) => `${routePrefix}/client/${id}`,
	CLIENT_NEW_PORTFOLIO: (clientId: string) => `${routePrefix}/client/${clientId}/portfolio/new`,
	CLIENT_PORTFOLIO: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}`,
	CLIENT_EDIT_PORTFOLIO: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/edit`,
	EDIT_CLIENT: (id: string) => `${routePrefix}/client/${id}/edit`,
	INVESTMENT: (clientId: string, portfolioId: string, investmentId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/investment/${investmentId}`,
	NEW_INVESTMENT: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/new-investment`,
	EDIT_INVESTMENT: (clientId: string, portfolioId: string, investmentId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/edit-investment/${investmentId}`,
	// Goal routes
	NEW_GOAL: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/goals/new`,
	RETIREMENT_GOAL_CALCULATOR: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/goals/retirement/calculator`,
	RETIREMENT_GOAL_PREVIEW: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/goals/retirement/preview`,
	KID_EDUCATION_GOAL_CALCULATOR: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/goals/kid-education/calculator`,
	KID_EDUCATION_GOAL_PREVIEW: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/goals/kid-education/preview`,
	SHARE: (portfolioId: string) => `${routePrefix}/share/${portfolioId}`,
	PDF_EXPORT_PARAMS: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/pdf-export-params`,
	PDF_EXPORT: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/pdf-export`,
	VIEW: (id: string) => `${routePrefix}/view/${id}`,
	PAYMENTS: `${routePrefix}/payments`,
	TERMS: `${routePrefix}/terms`,
	PRIVACY: `${routePrefix}/privacy`,
	WELCOME: `${routePrefix}/welcome`,
	DISCORD: `${routePrefix}/discord`,
	EMAIL: `${routePrefix}/email`,
	SAMPLE_PORTFOLIO_LINK: `${routePrefix}/view/au0ts392wixhshz0unsmf7fnl`,
	GET_STARTED: `${routePrefix}/get-started`,
	// Demo routes - client-independent portfolio simulation
	DEMO_TEMPLATES: `${routePrefix}/demo`,
	RETIREMENT_CALCULATOR: `${routePrefix}/demo/portfolio/retirement`,
	RETIREMENT_PREVIEW: () => `${routePrefix}/demo/portfolio/retirement/preview`,
	DEMO: () => `${routePrefix}/demo/portfolio`,
	DEMO_NEW_INVESTMENT: () => `${routePrefix}/demo/portfolio/new-investment`,
	DEMO_EDIT_INVESTMENT: (investmentId: string) =>
		`${routePrefix}/demo/portfolio/edit-investment/${investmentId}`,
	DEMO_BALANCE_INVESTMENTS: (goalIndex: number) =>
		`${routePrefix}/demo/portfolio/balance-investments/${goalIndex}`,
}

export const getStartedSections = {
	CREATE_CLIENT: 'create-client',
	CREATE_PORTFOLIO: 'create-portfolio',
	ADD_INVESTMENT: 'add-investment',
	ADD_TRANSACTION: 'add-transaction',
	REVIEW_AND_PRESENT: 'review-and-present',
	SHARE_PORTFOLIO: 'share-portfolio',
}

export const accountSections = {
	ACCOUNT: 'account',
	PAYMENT: 'payment',
}

export const apiRoutes = {
	ROOT: '/api',
	CHECKOUT: `${routeApiPrefix}/api/payments/checkout`,
	CUSTOMER_EMAIL: `${routeApiPrefix}/api/payments/customer/email`,
	PORTAL: (sessionId: string) => `${routeApiPrefix}/api/payments/portal/${sessionId}`,
	PORTAL_CUSTOMER: (customerId: string) =>
		`${routeApiPrefix}/api/payments/portal/customer/${customerId}`,
	PRICE: (priceId: string) => `${routeApiPrefix}/api/payments/price/${priceId}`,
	SUBSCRIPTIONS: `${routeApiPrefix}/api/payments/subscriptions`,
	SUCCESS: (sessionId: string) => `${routeApiPrefix}/api/payments/success/${sessionId}`,
	NEWSLETTER_SUBSCRIBE: `${routeApiPrefix}/api/newsletter/subscribe`,
	NEWSLETTER_UNSUBSCRIBE: `${routeApiPrefix}/api/newsletter/unsubscribe`,
	MCP: `${routeApiPrefix}/api/mcp`,
	EMAIL: `${routeApiPrefix}/api/email`,
} as const
