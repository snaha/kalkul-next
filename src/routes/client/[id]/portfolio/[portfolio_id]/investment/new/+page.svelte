<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import AddInvestment from '$lib/components/add-investment.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import routes from '$lib/routes'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'

	const portfolioId = parseInt($page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	const clientId = $derived(portfolio?.client)

	function close() {
		if (clientId) {
			goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))
		}
	}
</script>

<main>
	{#if portfolio}
		<AddInvestment {close} {portfolio} />
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
