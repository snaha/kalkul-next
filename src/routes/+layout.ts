import { browser } from '$app/environment'
import '$lib/locales' // Import to initialize. Important :)
import { locale, waitLocale } from 'svelte-i18n'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(window.navigator.language)
		// Load locales asynchronously without blocking page render
		waitLocale().catch((error) => {
			console.warn('Locale loading failed:', error)
		})
	} else {
		// On server, wait for locales to ensure SSR works properly
		await waitLocale()
	}
}
