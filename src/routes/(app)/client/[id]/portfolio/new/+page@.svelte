<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import AddPortfolio from '$lib/components/add-portfolio.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import routes from '$lib/routes'
	import { clientStore } from '$lib/stores/clients.svelte'

	const clientId = parseInt($page.params.id, 10)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))

	function close() {
		goto(routes.CLIENT(clientId))
	}
</script>

<main>
	{#if client}
		<AddPortfolio {close} {client} />
	{:else}
		<Typography variant="h2">404 Not found</Typography>
	{/if}
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
</style>
