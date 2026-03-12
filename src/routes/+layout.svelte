<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import '../app.pcss'
  import adapter from '$lib/adapters'
  import { locale, locales } from 'svelte-i18n'
  import { get } from 'svelte/store'
  import { browser } from '$app/environment'
  import { defaultLocale, LOCALE_STORAGE_KEY } from '$lib/locales'

  let { children } = $props()

  $effect(() => {
    const availableLocales = get(locales)
    const localStorageLocale = browser ? localStorage.getItem(LOCALE_STORAGE_KEY) : undefined

    if (localStorageLocale && availableLocales.includes(localStorageLocale)) {
      locale.set(localStorageLocale)
    } else if (browser) {
      for (const language of navigator.languages.concat([defaultLocale])) {
        if (availableLocales.includes(language.slice(0, 2))) {
          locale.set(language.slice(0, 2))
          return
        }
      }
    } else {
      locale.set(defaultLocale)
    }
  })

  onMount(() => {
    adapter.start()
  })

  onDestroy(() => {
    adapter.stop()
  })
</script>

{@render children()}
