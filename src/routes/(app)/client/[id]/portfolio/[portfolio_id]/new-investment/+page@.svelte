<script lang="ts">
	import { page } from '$app/stores'
	import EditInvestment from '$lib/components/edit-investment.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { _ } from 'svelte-i18n'

	const portfolioId = parseInt($page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))

	function close() {
		history.back()
	}
</script>

<Fullscreen>
	{#if portfolio}
		<EditInvestment {close} {portfolio} />
	{:else}
		<Typography variant="h2">404 - {$_('Not found')}</Typography>
	{/if}
</Fullscreen>
