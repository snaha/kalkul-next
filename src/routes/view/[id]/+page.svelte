<script lang="ts">
	import { page } from '$app/state'
	import adapters from '$lib/adapters'
	import Loader from '$lib/components/ui/loader.svelte'
	import PortfolioGraph from '$lib/components/graph-portfolio.svelte'
	import type { PortfolioView } from '$lib/types'
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'
	import ViewHeader from '$lib/components/view-header.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import PortfolioHeaderView from '$lib/components/portfolio-header-view.svelte'
	import { withInvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import InvestmentsSidebar from '$lib/components/investments-sidebar.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import { goto } from '$app/navigation'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import { ArrowLeft } from 'carbon-icons-svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { withPortfolioSimulationStore } from '$lib/stores/portfolio-simulation.svelte'

	const session_id = page.params.id
	let portfolioView: PortfolioView | undefined = $state()
	let notFound = $state(false)
	let adjustWithInflation = $state(false)
	let windowWidth = $state(0)
	let isMobile = $derived(windowWidth < 1024)

	const portfolioSimulation = withPortfolioSimulationStore()
	const graphData = $derived(portfolioSimulation.simulationData)

	// Recalculate when portfolioView changes
	$effect(() => {
		const view = portfolioView

		if (view) {
			// Start iterative calculation - updates progressively
			setTimeout(() => {
				portfolioSimulation.calculateIteratively(
					view.portfolio,
					view.investments,
					view.transactions,
				)
			}, 0)
		}
	})

	onMount(async () => {
		portfolioView = await adapters.portfolioView(session_id)
		if (!portfolioView) {
			notFound = true
			return
		}

		// Set store data because some components (e.g. graphs) assume they exist
		portfolioStore.data = [portfolioView.portfolio]
		investmentStore.data = portfolioView.investments
		transactionStore.data = portfolioView.transactions
	})
	let investmentsViewStore = withInvestmentsViewStore([])
	$effect(() => {
		const investments = portfolioView?.investments
		if (investments) {
			investmentsViewStore.allInvestments = investments
		}
	})

	let isGraphFullscreened = $state(false)
	let isSidebarOpen = $state(true)
	const mobileScreen: 'chart' | 'investments' = $derived(
		page.url.hash === '#investments' ? 'investments' : 'chart',
	)

	$effect(() => {
		if (!isGraphFullscreened) isSidebarOpen = true
	})
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if notFound}
	<Fullscreen>
		<div class="center">404 - {$_('common.notFound')}</div>
	</Fullscreen>
{:else if !portfolioView}
	<Fullscreen>
		<div class="center">
			<Loader />
		</div>
	</Fullscreen>
{:else if isMobile}
	<ViewHeader />
	<main class="mobile" class:investment={mobileScreen === 'investments'}>
		<Vertical --vertical-justify-content="space-between" --vertical-gap="0" class="grower">
			{#if mobileScreen === 'investments'}
				<ContentLayout centered={false} class="mobile-investment-header">
					<Horizontal --horizontal-gap="var(--half-padding)" --justify-content="stretch">
						<Button
							variant="ghost"
							dimension="compact"
							onclick={() => {
								history.back()
							}}><ArrowLeft size={20} /></Button
						>
						<Typography variant="h4">Investments</Typography>
					</Horizontal>
				</ContentLayout>
				<InvestmentsSidebar
					bind:isSidebarOpen
					isGraphFullscreened={false}
					isSidebarFlexible={true}
					{investmentsViewStore}
					client={portfolioView.client}
					portfolio={portfolioView.portfolio}
					investments={portfolioView.investments}
					transactionCount={portfolioView.transactions.length}
					{adjustWithInflation}
					viewOnly={true}
					{graphData}
				/>
				<div class="grower"></div>
			{:else if mobileScreen === 'chart'}
				<section class="topbar horizontal mobile">
					<PortfolioHeaderView portfolio={portfolioView.portfolio} />
				</section>

				<PortfolioGraph
					fullscreen={() => {
						isGraphFullscreened = !isGraphFullscreened
					}}
					fullscreenGraph="value"
					isSidebarOpen={false}
					isGraphFullscreened={true}
					bind:adjustWithInflation
					portfolio={portfolioView.portfolio}
					investments={portfolioView.investments}
					simulationData={graphData}
					{investmentsViewStore}
				/>
				<ContentLayout centered={false}>
					<Button
						variant="strong"
						dimension="compact"
						onclick={() => {
							goto('#investments')
						}}>{$_('common.showInvestments')}</Button
					>
				</ContentLayout>
			{/if}
		</Vertical>
	</main>
{:else}
	<ViewHeader portfolioName={portfolioView.portfolio.name} />
	<main class:sidebar-open={isSidebarOpen && isGraphFullscreened} class="fixed-height">
		<section class="horizontal grower fixed-height">
			{#if isSidebarOpen}
				<div class="vertical scrollable">
					<InvestmentsSidebar
						bind:isSidebarOpen
						{isGraphFullscreened}
						isSidebarFlexible={false}
						{investmentsViewStore}
						client={portfolioView.client}
						portfolio={portfolioView.portfolio}
						investments={portfolioView.investments}
						transactionCount={portfolioView.transactions.length}
						{adjustWithInflation}
						viewOnly={true}
						{graphData}
					/>
				</div>
			{/if}

			<PortfolioGraph
				fullscreen={() => {
					isGraphFullscreened = !isGraphFullscreened
					if (isGraphFullscreened) {
						isSidebarOpen = false
					}
				}}
				bind:isSidebarOpen
				{isGraphFullscreened}
				bind:adjustWithInflation
				portfolio={portfolioView.portfolio}
				investments={portfolioView.investments}
				simulationData={graphData}
				{investmentsViewStore}
			/>
		</section>
	</main>
{/if}

<style>
	:global(.absolute) {
		position: absolute;
		top: var(--padding);
		left: var(--padding);
		z-index: 1;
	}
	:root {
		--max-width: 1370px;
	}
	main {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 0;
		gap: var(--double-padding);
		transition: padding 0.3s ease-in;
		overflow: hidden;
	}
	main.mobile {
		min-height: calc(100dvh - var(--header-height));
		height: unset;
	}
	main.mobile.investment {
		background-color: var(--colors-low);
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: stretch;
		gap: 0;
		transition: gap 0.3s ease-in;
	}
	:global(.grower) {
		flex: 1;
	}
	.fixed-height {
		height: calc(100dvh - var(--header-height));
	}
	.scrollable {
		overflow-y: auto;
		max-height: 100%;
		background-color: var(--colors-low);
	}

	.center {
		display: flex;
		justify-content: center;
	}
	.topbar {
		border-bottom: 1px solid var(--colors-low);
	}
	.topbar.mobile {
		padding: 20px var(--padding);
	}
	:global(.mobile-investment-header) {
		box-shadow: 0px 1px 4px 0px #00000040;
		z-index: 1;
	}
</style>
