<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import '../app.pcss'
	import adapter from '$lib/adapters'
	import { page } from '$app/state'
	import LinkPreview from '$lib/components/link-preview.svelte'

	let { children } = $props()

	onMount(() => {
		adapter.start()
	})
	onDestroy(() => {
		adapter.stop()
	})

	function isProductionEnvironment() {
		return page.url.origin === 'https://kalkul.app'
	}
</script>

<svelte:head>
	{#if isProductionEnvironment()}
		<script
			defer
			src="https://cloud.umami.is/script.js"
			data-website-id="792b102b-b18a-440b-9fce-58639490a4d2"
		></script>
	{/if}
	<LinkPreview />
</svelte:head>

{@render children()}
