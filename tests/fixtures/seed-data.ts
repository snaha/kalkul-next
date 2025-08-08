// Test data that matches the seed.sql file
// This data is automatically seeded when Supabase starts

export const DEMO_USER = {
	id: '3c6a48fa-88fa-4cd9-bd0c-be4f4ac3a249',
	email: 'demo@kalkul.app',
	password: 'demo123',
	name: 'Demo User',
}

export const DEMO_CLIENT = {
	id: '1',
	name: 'Vanguardia Steadyworth',
	email: 'vanguardia@kalkul.app',
	birth_date: '1977-11-09',
	advisor: DEMO_USER.id,
}
