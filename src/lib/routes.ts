export default {
	HOME: '/',
	ACCOUNT: '/account',
	DEPOSIT: (index?: number) => `/deposit${index === undefined ? '' : `/${index}`}`,
	WITHDRAWAL: (index?: number) => `/withdrawal${index === undefined ? '' : `/${index}`}`,
	NEW_CLIENT: '/client/new',
	CLIENT: (id: number) => `/client/${id}`,
	CLIENT_NEW_PORTFOLIO: (clientId: number) => `/client/${clientId}/portfolio/new`,
	CLIENT_PORTFOLIO: (clientId: number, portfolioId: number) =>
		`/client/${clientId}/portfolio/${portfolioId}`,
	CLIENT_EDIT_PORTFOLIO: (clientId: number, portfolioId: number) =>
		`/client/${clientId}/portfolio/${portfolioId}/edit`,
	EDIT_CLIENT: (id: number) => `/client/${id}/edit`,
	INVESTMENT: (clientId: number, portfolioId: number, investmentId: number) =>
		`/client/${clientId}/portfolio/${portfolioId}/investment/${investmentId}`,
	NEW_INVESTMENT: (clientId: number, portfolioId: number) =>
		`/client/${clientId}/portfolio/${portfolioId}/investment/new`,
	SHARE: (portfolioId: number) => `/share/${portfolioId}`,
}
