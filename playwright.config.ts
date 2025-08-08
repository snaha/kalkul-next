import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './tests',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: 'html',
	timeout: 120000,
	// Note: Database seeding is handled automatically by supabase/seed.sql when Supabase starts
	expect: {
		timeout: 15000,
	},
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		actionTimeout: 10000,
		navigationTimeout: 30000,
	},

	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				launchOptions: {
					args: [
						'--disable-dev-shm-usage',
						'--no-sandbox',
						'--disable-setuid-sandbox',
						'--disable-gpu',
						'--disable-web-security',
						'--disable-features=VizDisplayCompositor',
					],
				},
			},
		},
	],

	webServer: {
		command: 'pnpm dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		stdout: 'pipe',
		stderr: 'pipe',
		env: {
			PUBLIC_ORIGIN: 'http://localhost:5173',
			PUBLIC_SUPABASE_URL: 'http://127.0.0.1:64321',
			PUBLIC_SUPABASE_ANON_KEY:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
			PUBLIC_DISABLE_PAYWALL: 'true',
		},
	},
})
