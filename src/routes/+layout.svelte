<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import '../app.pcss'
	import adapter from '$lib/adapters'

	let { children } = $props()

	onMount(() => {
		adapter.start()
	})
	onDestroy(() => {
		adapter.stop()
	})
</script>

<svelte:head>
	<script
		defer
		src="https://cloud.umami.is/script.js"
		data-website-id="792b102b-b18a-440b-9fce-58639490a4d2"
	></script>
</svelte:head>

{@render children()}
