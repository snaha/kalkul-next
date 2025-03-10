<script lang="ts">
	import { page } from '$app/state'
	import EditPortfolio from '$lib/components/edit-portfolio.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'

	const clientId = parseInt(page.params.id, 10)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))

	function close() {
		history.back()
	}
</script>

<Fullscreen>
	{#if client}
		<EditPortfolio {close} {client} />
	{:else}
		<Typography variant="h2">404 Not found</Typography>
	{/if}
</Fullscreen>
