import { defineConfig, devices } from '@playwright/experimental-ct-svelte'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import autoprefixer from 'autoprefixer'
import postcssNesting from 'postcss-nesting'

export default defineConfig({
	testDir: './src',
	testMatch: '**/*.ct.spec.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		trace: 'on-first-retry',
		ctViteConfig: {
			plugins: [
				svelte({
					preprocess: vitePreprocess(),
				}),
			],
			css: {
				postcss: {
					plugins: [autoprefixer, postcssNesting],
				},
			},
		},
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
	],
})
