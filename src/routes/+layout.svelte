<script>
	import { onDestroy, onMount } from 'svelte'
	import '../app.pcss'
	import adapter from '$lib/adapters'

	onMount(() => {
		adapter.start()
	})
	onDestroy(() => {
		adapter.stop()
	})
</script>

<slot />
