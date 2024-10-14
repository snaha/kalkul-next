<script lang="ts">
	// FIXME: this should be removed once issue with using $ in svelte 5 is clearer (here the issue is $locale)
	/* eslint svelte/valid-compile: 0 */
	import { browser } from '$app/environment'
	import { locale, locales } from 'svelte-i18n'
	import Button from './ui/button.svelte'

	// Assuming $locale is automatically set by svelte-i18n to the browser's setting, e.g., 'en-US'
	$effect(() => {
		if ($locale && !$locales.includes($locale)) {
			$locale = $locale.split('-')[0] // Normalize 'en-US' to 'en'
			if (!$locales.includes($locale)) {
				$locale = $locales[0] // Default to the first locale if the normalized locale is still not in the list
			}
		}
	})
	$effect(() => {
		if (browser && $locale) localStorage.setItem('user-lang', $locale)
	})
</script>

<div class="lang">
	<Button
		variant={'ghost'}
		onclick={() => {
			$locale = $locale === 'en' ? 'cs' : 'en'
		}}>{$locale}</Button
	>
</div>

<style>
	.lang {
		position: absolute;
		top: 0;
		right: 0;
	}
</style>
