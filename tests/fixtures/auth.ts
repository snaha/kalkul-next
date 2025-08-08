import { test as base, type Page } from '@playwright/test'
import { DEMO_USER } from './seed-data'

type AuthFixtures = {
	authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
	authenticatedPage: async ({ page }, use) => {
		// Perform actual login using the demo user from seed.sql
		await page.goto('/login')

		// Fill in login form with demo user credentials
		await page.locator('input').first().fill(DEMO_USER.email)
		await page.locator('input[type="password"]').fill(DEMO_USER.password)

		// Click login button
		await page.getByRole('button', { name: 'Login' }).click()

		// Wait for successful login redirect to dashboard
		await page.waitForURL('/', { timeout: 10000 })

		// Verify we're logged in by checking for authenticated content
		await page.waitForLoadState('networkidle')

		await use(page)
	},
})

export { expect } from '@playwright/test'
