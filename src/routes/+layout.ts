import { browser } from '$app/environment'
import '$lib/locales' // Import to initialize. Important :)
import { locale, waitLocale } from 'svelte-i18n'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(window.navigator.language)
	}

	// Add timeout to prevent blocking in restricted environments like Instagram's in-app browser
	try {
		await Promise.race([
			waitLocale(),
			new Promise((_, reject) =>
				setTimeout(() => reject(new Error('Locale loading timeout')), 3000),
			),
		])
	} catch (error) {
		// Fallback: continue with default locale if loading fails or times out
		console.warn('Locale loading failed, using default:', error)
	}
}
