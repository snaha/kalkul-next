<script lang="ts">
	import { page } from '$app/state'
	import { _ } from 'svelte-i18n'

	const template = page.url.searchParams.get('template') || 'welcome'
	const language = page.url.searchParams.get('language') || 'en' // Default to English for preview
	const unsubscribeLink = page.url.searchParams.get('unsubscribe') || ''
</script>

<iframe
	src={`/api/email/preview?template=${template}&language=${language}&unsubscribe=${unsubscribeLink}`}
	title={$_('common.preview')}
></iframe>

<style>
	iframe {
		margin: 0;
		padding: 0;
		width: 100dvw;
		height: 100dvh;
	}
</style>
