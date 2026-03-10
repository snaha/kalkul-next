import { base } from '$app/paths'
const ROUTER = import.meta.env.VITE_ROUTER

const routePrefix = `${base}${ROUTER === 'hash' ? '/#' : ''}`

export default {
	HOME: `${routePrefix}/`,
	SETTINGS: `${routePrefix}/settings`,
	NEW_CLIENT: `${routePrefix}/client/new`,
	CLIENT: (id: string) => `${routePrefix}/client/${id}`,
	CLIENT_NEW_PORTFOLIO: (clientId: string) => `${routePrefix}/client/${clientId}/portfolio/new`,
	CLIENT_PORTFOLIO: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}`,
	CLIENT_EDIT_PORTFOLIO: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/edit`,
	EDIT_CLIENT: (id: string) => `${routePrefix}/client/${id}/edit`,
	NEW_INVESTMENT: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/new-investment`,
	EDIT_INVESTMENT: (clientId: string, portfolioId: string, investmentId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/edit-investment/${investmentId}`,
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
	PDF_EXPORT_PARAMS: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/pdf-export-params`,
	PDF_EXPORT: (clientId: string, portfolioId: string) =>
		`${routePrefix}/client/${clientId}/portfolio/${portfolioId}/pdf-export`,
}
