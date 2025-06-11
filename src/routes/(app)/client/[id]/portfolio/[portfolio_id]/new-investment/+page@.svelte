<script lang="ts">
	import { page } from '$app/state'
	import EditInvestment from '$lib/components/edit-investment.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { _ } from 'svelte-i18n'

	const portfolioId = parseInt(page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))

	function close() {
		history.back()
	}
</script>

<Fullscreen>
	{#if portfolioStore.loading}
		<Loader />
	{:else if portfolio}
		<EditInvestment {close} {portfolio} />
	{:else}
		<Typography variant="h2">404 - {$_('common.notFound')}</Typography>
	{/if}
</Fullscreen>
