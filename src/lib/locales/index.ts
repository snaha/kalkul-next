import { browser } from '$app/environment'
import { init, register } from 'svelte-i18n'

const defaultLocale = 'en'

register('en', () => import('$lib/locales/en.json'))
register('cs', () => import('$lib/locales/cs.json'))

init({
	fallbackLocale: defaultLocale,
	initialLocale:
		(browser ? (localStorage.getItem('user-lang') ?? window.navigator.language) : undefined) ??
		defaultLocale,
})
