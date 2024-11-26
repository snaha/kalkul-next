export default {
	HOME: '/',
	NEW_CLIENT: '/client/new',
	CLIENT: (id: number) => `/client/${id}`,
	CLIENT_NEW_PORTFOLIO: (clientId: number) => `/client/${clientId}/portfolio/new`,
	CLIENT_PORTFOLIO: (clientId: number, portfolioId: number) =>
		`/client/${clientId}/portfolio/${portfolioId}`,
	INVESTMENT: (clientId: number, portfolioId: number, investmentId: number) =>
		`/client/${clientId}/portfolio/${portfolioId}/investment/${investmentId}`,
	NEW_INVESTMENT: (clientId: number, portfolioId: number) =>
		`/client/${clientId}/portfolio/${portfolioId}/investment/new`,
	SHARE: (portfolioId: number) => `/share/${portfolioId}`,
}
