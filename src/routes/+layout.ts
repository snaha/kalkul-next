import '$lib/locales' // Import to initialize. Important :)
import { locale, waitLocale } from 'svelte-i18n'
import type { LayoutLoad } from './$types'

export const ssr = false

export const load: LayoutLoad = async () => {
  locale.set(window.navigator.language)
  await waitLocale()
}
