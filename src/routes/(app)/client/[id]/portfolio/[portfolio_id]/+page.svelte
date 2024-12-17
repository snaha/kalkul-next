<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { Add } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Loader from '$lib/components/ui/loader.svelte'
	import routes from '$lib/routes'
	import { page } from '$app/stores'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { goto } from '$app/navigation'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import InvestmentCard from '$lib/components/investment-card.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import PortfolioHeader from '$lib/components/portfolio-header.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import PortfolioGraph from '$lib/components/graph-portfolio.svelte'

	const clientId = parseInt($page.params.id, 10)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = parseInt($page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	const investments = $derived(investmentStore.filter(portfolioId))

	function addInvestment() {
		goto(routes.NEW_INVESTMENT(clientId, portfolioId))
	}
</script>

{#if portfolioStore.loading}
	<Fullscreen>
		<Loader />
	</Fullscreen>
{:else if !portfolio || !client}
	<Fullscreen>
		404 - {$_('Not found')}
	</Fullscreen>
{:else}
	<main>
		<PortfolioHeader {client} {portfolio} />
		<section class="horizontal grower">
			<section class="sidebar vertical">
				<section class="investments">
					{#each investments as investment}
						<InvestmentCard {investment} {portfolio} />
					{/each}
				</section>
				<Button dimension="small" variant="strong" onclick={addInvestment}>
					<Add size={16} />{$_('addInvestment')}</Button
				>
			</section>
			<PortfolioGraph {portfolio} {investments} />
		</section>
	</main>
{/if}

<style>
	:root {
		--max-width: 1370px;
	}
	main {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--half-padding);
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--padding);
	}
	:global(.grower) {
		flex: 1;
	}
	.sidebar {
		width: 320px;
		border-right: 1px solid var(--colors-low);
		height: 100%;
		padding: var(--padding);
	}
	.investments {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
</style>
