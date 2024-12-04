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

{@render children()}
