<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import '../app.pcss'
	import adapter from '$lib/adapters'
	import { page } from '$app/state'
	import LinkPreview from '$lib/components/link-preview.svelte'
	import { locale, locales } from 'svelte-i18n'
	import { get } from 'svelte/store'
	import { authStore } from '$lib/stores/auth.svelte'
	import { browser } from '$app/environment'
	import { defaultLocale, LOCALE_STORAGE_KEY } from '$lib/locales'

	let { children } = $props()

	$effect(() => {
		const availableLocales = get(locales)
		const localStorageLocale = browser ? localStorage.getItem(LOCALE_STORAGE_KEY) : undefined

		if (
			authStore.user?.user_metadata.prefer_language &&
			availableLocales.includes(authStore.user.user_metadata.prefer_language)
		) {
			// If the user is logged in use their preferred language
			locale.set(authStore.user.user_metadata.prefer_language)
		} else if (localStorageLocale && availableLocales.includes(localStorageLocale)) {
			// Or used the language that is localStorage
			locale.set(localStorageLocale)
		} else if (browser) {
			// Or use the language set in the browser
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

	function isProductionEnvironment() {
		return page.url.origin === 'https://kalkul.app'
	}

	function isInstagramBrowser() {
		return browser && navigator.userAgent.includes('Instagram')
	}

	function isiOS() {
		return browser && navigator.userAgent.includes('iOS')
	}
</script>

<svelte:head>
	<!-- Disable Umami Analytics on Instagram in-app browser on iOS -->
	{#if isProductionEnvironment() && !(isiOS() && isInstagramBrowser())}
		<script
			defer
			src="https://cloud.umami.is/script.js"
			data-website-id="792b102b-b18a-440b-9fce-58639490a4d2"
		></script>
	{/if}
	<LinkPreview />
</svelte:head>

{@render children()}
