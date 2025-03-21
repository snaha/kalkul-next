<script lang="ts">
	import { page } from '$app/state'
	import adapters from '$lib/adapters'
	import InvestmentCard from '$lib/components/investment-card.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import PortfolioGraph from '$lib/components/graph-portfolio.svelte'
	import type { PortfolioView } from '$lib/types'
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'
	import ViewHeader from '$lib/components/view-header.svelte'
	import Sidebar from '$lib/components/sidebar.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import PortfolioHeaderView from '$lib/components/portfolio-header-view.svelte'
	import { withInvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import { Menu, SidePanelCloseFilled, SidePanelOpenFilled } from 'carbon-icons-svelte'
	import Toggle from '$lib/components/ui/toggle.svelte'
	import Badge from '$lib/components/ui/badge.svelte'

	const session_id = page.params.id
	let portfolioView: PortfolioView | undefined = $state()
	let notFound = $state(false)
	let adjustWithInflation = $state(false)
	let windowWidth = $state(0)
	let isMobile = $derived(windowWidth < 1024)

	onMount(async () => {
		portfolioView = await adapters.portfolioView(session_id)
		if (!portfolioView) {
			notFound = true
		}
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
	let showInvetments = $state(false)
	$effect(() => {
		if (!isGraphFullscreened) isSidebarOpen = true
	})
</script>

<svelte:window bind:innerWidth={windowWidth} />
{#snippet sidebarButton()}
	<Button
		variant="ghost"
		dimension="small"
		active={showInvetments}
		onclick={() => {
			showInvetments = !showInvetments
			isGraphFullscreened = false
		}}><Menu size={16} />Investments</Button
	>
{/snippet}

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
{:else if isMobile}
	<ViewHeader />
	{#if !isGraphFullscreened}
		<section class="topbar horizontal mobile">
			<PortfolioHeaderView
				client={portfolioView.client}
				portfolio={portfolioView.portfolio}
				avatarSize={48}
			/>
		</section>
		<section class="topbar horizontal mobile">
			{@render sidebarButton()}
			<div class="inflation-container">
				<Toggle label={$_('Show inflation')} dimension="small" bind:checked={adjustWithInflation}
				></Toggle>
				{#if adjustWithInflation}
					<Badge dimension="small">{portfolioView.portfolio.inflation_rate * 100}%</Badge>
				{/if}
			</div>
		</section>
	{/if}
	<main class="main mobile" class:fullscreen-graph={isGraphFullscreened}>
		{#if showInvetments}
			<section class="sidebar-container">
				<Sidebar --sidebar-padding="0" --sidebar-width="560px">
					<section class="investments">
						{#each portfolioView.investments as investment, i}
							<InvestmentCard
								viewOnly={true}
								{investment}
								portfolio={portfolioView.portfolio}
								index={i}
								hidden={investmentsViewStore.isHidden(investment.id)}
								focused={investmentsViewStore.isFocused(investment.id)}
								toggleHide={() => {
									investmentsViewStore.toggleHide(investment.id)
								}}
								toggleFocus={() => {
									investmentsViewStore.toggleFocus(investment.id)
								}}
							/>
						{/each}
					</section>
				</Sidebar>
			</section>
		{:else}
			<section class="graph-container">
				<PortfolioGraph
					view
					{sidebarButton}
					fullscreen={() => {
						isGraphFullscreened = !isGraphFullscreened
						isSidebarOpen = false
					}}
					{isSidebarOpen}
					{isGraphFullscreened}
					bind:adjustWithInflation
					portfolio={portfolioView.portfolio}
					investments={portfolioView.investments}
					{investmentsViewStore}
				/>
			</section>
		{/if}
	</main>
{:else}
	<ViewHeader />
	{#if !isGraphFullscreened}
		<section class="topbar horizontal">
			<PortfolioHeaderView
				client={portfolioView.client}
				portfolio={portfolioView.portfolio}
				investments={portfolioView.investments}
				bind:adjustWithInflation
			/>
		</section>
	{/if}
	<main
		class:fullscreen-graph={isGraphFullscreened}
		class:sidebar-open={isSidebarOpen && isGraphFullscreened}
	>
		{#if isGraphFullscreened}
			<Button
				class="absolute"
				variant="ghost"
				dimension="small"
				onclick={() => (isSidebarOpen = !isSidebarOpen)}
			>
				{#if isSidebarOpen}
					<SidePanelCloseFilled size={16} />
				{:else}
					<SidePanelOpenFilled size={16} />
				{/if}
			</Button>
		{/if}
		<section class="horizontal grower">
			<Sidebar
				--sidebar-gap="var(--padding)"
				--sidebar-padding="0"
				{isGraphFullscreened}
				{isSidebarOpen}
			>
				<section class="investments">
					{#each portfolioView.investments as investment, i}
						<InvestmentCard
							viewOnly={true}
							{investment}
							portfolio={portfolioView.portfolio}
							index={i}
							hidden={investmentsViewStore.isHidden(investment.id)}
							focused={investmentsViewStore.isFocused(investment.id)}
							toggleHide={() => {
								investmentsViewStore.toggleHide(investment.id)
							}}
							toggleFocus={() => {
								investmentsViewStore.toggleFocus(investment.id)
							}}
						/>
					{/each}
				</section>
			</Sidebar>
			<PortfolioGraph
				fullscreen={() => {
					isGraphFullscreened = !isGraphFullscreened
				}}
				{isSidebarOpen}
				{isGraphFullscreened}
				bind:adjustWithInflation
				portfolio={portfolioView.portfolio}
				investments={portfolioView.investments}
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
		width: 100vw;
		position: relative;
		min-height: calc(100vh - 180px);
		display: flex;
		flex-direction: column;
		padding: var(--double-padding);
		gap: var(--double-padding);
		transition: padding 0.3s ease-in;
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
		gap: var(--padding);
		transition: gap 0.3s ease-in;
	}
	:global(.grower) {
		flex: 1;
	}
	.investments {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
	.mobile {
		padding: var(--padding);
		gap: var(--half-padding);
	}
	.inflation-container {
		display: flex;
		align-items: center;
		gap: var(--half-padding);
	}
	.main {
		gap: var(--padding);
		min-height: calc(100vh - 206px);
		display: flex;
		flex-direction: row;
		overflow: hidden;
		transition: unset;
	}
	.fullscreen-graph {
		min-height: calc(100vh - 50px);
		padding: 0;
		.horizontal {
			gap: 0;
		}
	}
	.sidebar-open {
		padding: 0 0 0 var(--padding);
		.horizontal {
			gap: var(--padding);
		}
	}
	.sidebar-container {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	.graph-container {
		width: 100%;
		min-height: 100%;
	}
</style>
