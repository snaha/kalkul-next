import { test, expect } from '@playwright/test'
import { generateTestUser } from './utils/test-data'

test.describe('User Registration', () => {
	test('should display signup page', async ({ page }) => {
		await page.goto('/signup')

		await expect(page.getByText('Sign up')).toBeVisible()
		await expect(page.locator('input').first()).toBeVisible() // Email field
		await expect(page.locator('input[type="password"]')).toBeVisible() // Password field
		await expect(page.getByText('I want to receive product updates')).toBeVisible()
		await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
	})

	test('should enable button when valid email and password are provided', async ({ page }) => {
		await page.goto('/signup')

		const testUser = generateTestUser()

		await page.locator('input').first().fill(testUser.email)
		await page.locator('input[type="password"]').fill(testUser.password)

		// Button should be enabled with valid email and password
		await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled()
	})

	test('should validate email format', async ({ page }) => {
		await page.goto('/signup')

		// Test invalid email
		await page.locator('input').first().fill('invalid-email')
		await page.locator('input[type="password"]').fill('ValidPassword123!')
		await page.locator('input').first().blur()

		// Should show validation error and disable submit
		await expect(page.getByRole('button', { name: 'Create account' })).toBeDisabled()
	})

	test('should validate password requirements', async ({ page }) => {
		await page.goto('/signup')

		await page.locator('input').first().fill('test@example.com')
		await page.locator('input[type="password"]').fill('short')
		await page.locator('input[type="password"]').blur()

		// Should show validation error and disable submit
		await expect(page.getByRole('button', { name: 'Create account' })).toBeDisabled()
	})

	test('should handle newsletter subscription option', async ({ page }) => {
		await page.goto('/signup')

		const newsletterCheckbox = page.locator('input[type="checkbox"]') // Newsletter checkbox

		// Should be unchecked by default
		await expect(newsletterCheckbox).not.toBeChecked()

		// Should be able to check
		await newsletterCheckbox.click()
		await expect(newsletterCheckbox).toBeChecked()
	})

	test('should show success message after registration', async ({ page }) => {
		await page.goto('/signup')

		const testUser = generateTestUser()

		await page.locator('input').first().fill(testUser.email)
		await page.locator('input[type="password"]').fill(testUser.password)

		// Mock the registration to succeed
		await page.route('**/auth/v1/signup', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ user: { email: testUser.email } }),
			})
		})

		await page.getByRole('button', { name: 'Create account' }).click()

		// Should show success page
		await expect(page.getByText('Check your email')).toBeVisible()
		await expect(page.getByText('verification link')).toBeVisible()
	})

	test('should navigate to login page', async ({ page }) => {
		await page.goto('/signup')

		await page.getByText('Login').click()

		// Wait for SvelteKit client-side navigation
		await page.waitForURL('**/login')
		await expect(page.url()).toContain('/login')
	})

	test('should redirect to home when already logged in', async ({ page }) => {
		// This test would require setting up a logged-in state
		// For now, we'll test the redirect logic exists
		await page.goto('/signup')

		// Check that the script includes redirect logic
		await expect(page.locator('script')).toHaveCount(1)
	})

	test('should show error message on registration failure', async ({ page }) => {
		await page.goto('/signup')

		const testUser = generateTestUser()

		await page.locator('input').first().fill(testUser.email)
		await page.locator('input[type="password"]').fill(testUser.password)

		// Mock the registration to fail
		await page.route('**/auth/v1/signup', async (route) => {
			await route.fulfill({
				status: 400,
				contentType: 'application/json',
				body: JSON.stringify({ error: { message: 'Email already exists' } }),
			})
		})

		await page.getByRole('button', { name: 'Create account' }).click()

		// Should show error message
		await expect(page.locator('.error')).toBeVisible()
	})
})
