import { test, expect } from '@playwright/test'
import { test as authTest } from './fixtures/auth'
import { DEMO_CLIENT } from './fixtures/seed-data'

test.describe('Portfolio Management - Public', () => {
	test('should redirect to login when accessing protected client creation page', async ({
		page,
	}) => {
		await page.goto('/client/new')

		// Should display the login page since route is protected
		await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
	})

	test('should redirect to login when accessing portfolio creation', async ({ page }) => {
		await page.goto(`/client/${DEMO_CLIENT.id}/portfolio/new`)

		// Should display the login page since route is protected
		await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
	})
})

test.describe('Portfolio Management - Authenticated', () => {
	// TODO: Fix authentication fixture to properly handle Supabase login with seeded demo user
	// Currently skipped as the auth flow needs proper session management
	authTest.skip(
		'should load client creation page when authenticated',
		async ({ authenticatedPage }) => {
			await authenticatedPage.goto('/client/new')

			// Now should see the client creation page - check for any relevant content
			await expect(authenticatedPage.locator('h1, h2, h3').first()).toBeVisible()
			// Verify we're on the client creation page
			await expect(authenticatedPage.url()).toContain('/client/new')
		},
	)

	authTest.skip(
		'should access portfolio creation when authenticated',
		async ({ authenticatedPage }) => {
			// Use the demo client from seed.sql for portfolio creation
			await authenticatedPage.goto(`/client/${DEMO_CLIENT.id}/portfolio/new`)

			// Should load the portfolio creation page
			await expect(authenticatedPage.locator('h1, h2, h3').first()).toBeVisible()
			// Verify we're on the portfolio creation page
			await expect(authenticatedPage.url()).toContain('/portfolio/new')
		},
	)

	authTest.skip('should display seeded demo data', async ({ authenticatedPage }) => {
		// Test that seeded data from seed.sql is accessible in authenticated tests
		await authenticatedPage.goto('/')

		// Should see the dashboard page with some content
		await expect(authenticatedPage.locator('h1, h2, h3').first()).toBeVisible()
		// The demo user should have access to the demo client
		await expect(authenticatedPage.getByText('Vanguardia Steadyworth')).toBeVisible()
	})
})
