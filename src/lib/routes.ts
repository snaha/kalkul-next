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
	DEPOSIT: (index?: number) => `${routePrefix}/deposit${index === undefined ? '' : `/${index}`}`,
	WITHDRAWAL: (index?: number) =>
		`${routePrefix}/withdrawal${index === undefined ? '' : `/${index}`}`,
	NEW_CLIENT: `${routePrefix}/client/new`,
	CLIENT: (id: number) => `${routePrefix}/client/${id}`,
	CLIENT_NEW_PORTFOLIO: (clientId: number) => `${routePrefix}/client/${clientId}/portfolio/new`,
	CLIENT_PORTFOLIO: (clientId: number, portfolioId: number) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}`,
	CLIENT_EDIT_PORTFOLIO: (clientId: number, portfolioId: number) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/edit`,
	EDIT_CLIENT: (id: number) => `${routePrefix}/client/${id}/edit`,
	INVESTMENT: (clientId: number, portfolioId: number, investmentId: number) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/investment/${investmentId}`,
	NEW_INVESTMENT: (clientId: number, portfolioId: number) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/new-investment`,
	EDIT_INVESTMENT: (clientId: number, portfolioId: number, investmentId: number) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/edit-investment/${investmentId}`,
	SHARE: (portfolioId: number) => `${routePrefix}/share/${portfolioId}`,
	PDF_EXPORT_PARAMS: (clientId: number, portfolioId: number) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/pdf-export-params`,
	PDF_EXPORT: (clientId: number, portfolioId: number) =>
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
}

export const getStartedSections = {
	CREATE_CLIENT: 'create-client',
	CREATE_PORTFOLIO: 'create-portfolio',
	ADD_INVESTMENT: 'add-investment',
	ADD_TRANSACTION: 'add-transaction',
	REVIEW_AND_PRESENT: 'review-and-present',
	SHARE_PORTFOLIO: 'share-portfolio',
}

export const apiRoutes = {
	ROOT: '/api',
	CHECKOUT: `${routeApiPrefix}/api/payments/checkout`,
	CUSTOMER: `${routeApiPrefix}/api/payments/customer`,
	PORTAL: (sessionId: string) => `${routeApiPrefix}/api/payments/portal/${sessionId}`,
	PORTAL_CUSTOMER: (customerId: string) =>
		`${routeApiPrefix}/api/payments/portal/customer/${customerId}`,
	PRICE: (priceId: string) => `${routeApiPrefix}/api/payments/price/${priceId}`,
	SUBSCRIPTIONS: `${routeApiPrefix}/api/payments/subscriptions`,
	SUCCESS: (sessionId: string) => `${routeApiPrefix}/api/payments/success/${sessionId}`,
	NEWSLETTER_SUBSCRIBE: `${routeApiPrefix}/api/newsletter/subscribe`,
	NEWSLETTER_UNSUBSCRIBE: (subscriptionId: string) =>
		`${routeApiPrefix}/api/newsletter/unsubscribe/${subscriptionId}`,
}
