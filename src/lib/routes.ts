import { base } from '$app/paths'

export default {
	HOME: `${base}/`,
	FORGOT_PASSWORD: `${base}/forgot-password`,
	SIGNUP: `${base}/signup`,
	LOGIN: `${base}/login`,
	ACCOUNT: `${base}/account`,
	DEPOSIT: (index?: number) => `${base}/deposit${index === undefined ? '' : `/${index}`}`,
	WITHDRAWAL: (index?: number) => `${base}/withdrawal${index === undefined ? '' : `/${index}`}`,
	NEW_CLIENT: `${base}/client/new`,
	CLIENT: (id: number) => `${base}/client/${id}`,
	CLIENT_NEW_PORTFOLIO: (clientId: number) => `${base}/client/${clientId}/portfolio/new`,
	CLIENT_PORTFOLIO: (clientId: number, portfolioId: number) =>
		`${base}/client/${clientId}/portfolio/${portfolioId}`,
	CLIENT_EDIT_PORTFOLIO: (clientId: number, portfolioId: number) =>
		`${base}/client/${clientId}/portfolio/${portfolioId}/edit`,
	EDIT_CLIENT: (id: number) => `${base}/client/${id}/edit`,
	INVESTMENT: (clientId: number, portfolioId: number, investmentId: number) =>
		`${base}/client/${clientId}/portfolio/${portfolioId}/investment/${investmentId}`,
	NEW_INVESTMENT: (clientId: number, portfolioId: number) =>
		`${base}/client/${clientId}/portfolio/${portfolioId}/new-investment`,
	EDIT_INVESTMENT: (clientId: number, portfolioId: number, investmentId: number) =>
		`${base}/client/${clientId}/portfolio/${portfolioId}/edit-investment/${investmentId}`,
	SHARE: (portfolioId: number) => `${base}/share/${portfolioId}`,
}
