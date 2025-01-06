<script lang="ts">
	import { page } from '$app/stores'
	import adapters from '$lib/adapters'
	import InvestmentCard from '$lib/components/investment-card.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import PortfolioGraph from '$lib/components/graph-portfolio.svelte'
	import type { PortfolioView } from '$lib/types'
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'
	import ViewHeader from '$lib/components/view-header.svelte'
	import Sidebar from '$lib/components/sidebar.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'

	const session_id = $page.params.id
	let portfolioView: PortfolioView | undefined = $state()
	let notFound = $state(false)

	onMount(async () => {
		portfolioView = await adapters.portfolioView(session_id)
		if (!portfolioView) {
			notFound = true
		}
	})
</script>

{#if notFound}
	<Fullscreen>
		<div class="center">404 - {$_('Page not found')}</div>
	</Fullscreen>
{:else if !portfolioView}
	<Fullscreen>
		<div class="center">
			<Loader />
		</div>
	</Fullscreen>
{:else}
	<ViewHeader />
	<section class="topbar horizontal">
		<Typography variant="h4" bold>{portfolioView.portfolio.name}</Typography>
		<div class="grower"></div>
	</section>
	<main>
		<section class="horizontal grower">
			<Sidebar --sidebar-gap="var(--padding)" --sidebar-padding="0">
				<section class="investments">
					{#each portfolioView.investments as investment, i}
						<InvestmentCard
							viewOnly={true}
							{investment}
							portfolio={portfolioView.portfolio}
							index={i}
						/>
					{/each}
				</section>
			</Sidebar>
			<PortfolioGraph portfolio={portfolioView.portfolio} investments={portfolioView.investments} />
		</section>
	</main>
{/if}

<style>
	:root {
		--max-width: 1370px;
	}
	main {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		padding: var(--double-padding);
	}
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
	.topbar {
		padding: var(--double-padding);
		border-bottom: 1px solid var(--colors-low);
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--padding);
	}
	:global(.grower) {
		flex: 1;
	}
	.investments {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
</style>
