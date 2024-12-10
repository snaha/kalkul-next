<script lang="ts">
	import { page } from '$app/stores'
	import EditPortfolio from '$lib/components/edit-portfolio.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'

	const clientId = parseInt($page.params.id, 10)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = parseInt($page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))

	function close() {
		history.back()
	}
</script>

<Fullscreen>
	{#if client && portfolio}
		<EditPortfolio {close} {client} {portfolio} />
	{:else}
		<Typography variant="h2">404 Not found</Typography>
	{/if}
</Fullscreen>
