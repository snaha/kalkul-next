export default {
	HOME: '/',
	DEPOSIT: (index?: number) => `/deposit${index === undefined ? '' : `/${index}`}`,
	WITHDRAWAL: (index?: number) => `/withdrawal${index === undefined ? '' : `/${index}`}`,
	NEW_CLIENT: '/client/new',
	CLIENT: (id: number) => `/client/${id}`,
	CLIENT_NEW_PORTFOLIO: (clientId: number) => `/client/${clientId}/portfolio/new`,
	CLIENT_PORTFOLIO: (clientId: number, portfolioId: number) =>
		`/client/${clientId}/portfolio/${portfolioId}`,
}
