import { browser } from '$app/environment'
import { init, register } from 'svelte-i18n'

export const defaultLocale = 'cs'
export const LOCALE_STORAGE_KEY = 'locale'

register('en', () => import('$lib/locales/en.json'))
register('cs', () => import('$lib/locales/cs.json'))

init({
  fallbackLocale: defaultLocale,
  initialLocale: (browser ? window.navigator.language : undefined) ?? defaultLocale,
})
