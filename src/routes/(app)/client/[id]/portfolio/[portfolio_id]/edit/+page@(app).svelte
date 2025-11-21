<script lang="ts">
	import { _ } from 'svelte-i18n'
	import { page } from '$app/state'
	import EditPortfolio from '$lib/components/edit-portfolio.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'

	const clientId = page.params.id
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = page.params.portfolio_id
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))

	function close() {
		history.back()
	}
</script>

<Fullscreen>
	{#if client && portfolio}
		<EditPortfolio {close} {client} {portfolio} />
	{:else}
		<Typography variant="h2">404 - {$_('common.notFound')}</Typography>
	{/if}
</Fullscreen>
