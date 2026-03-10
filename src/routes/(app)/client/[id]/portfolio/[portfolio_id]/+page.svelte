<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { SidePanelCloseFilled, SidePanelOpenFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Loader from '$lib/components/ui/loader.svelte'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { goto } from '$app/navigation'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import PortfolioHeader from '$lib/components/portfolio-header.svelte'
	import PortfolioGraph from '$lib/components/graph-portfolio.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import { withInvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import { base } from '$app/paths'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import MobileOnly from '$lib/components/mobile-only.svelte'
	import DesktopOnly from '$lib/components/desktop-only.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import PortfolioSidebar from '$lib/components/portfolio-sidebar.svelte'
	import { withPortfolioSimulationStore } from '$lib/stores/portfolio-simulation.svelte'

	const clientId = $derived(page.params.id)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = $derived(page.params.portfolio_id)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))

	const goalsFeatureEnabled = true

	let selectedTab = $state<'goals' | 'investments'>('goals')

	// Filter goals and regular investments using store methods
	const goals = $derived(investmentStore.filterGoals(portfolioId))
	const regularInvestments = $derived(investmentStore.filterRegularInvestments(portfolioId))

	// Separate simulations for goals and investments to avoid recalculation on tab switch
	const goalsSimulation = withPortfolioSimulationStore()
	const investmentsSimulation = withPortfolioSimulationStore()

	// Get transactions for goals and investments separately
	const goalIds = $derived(goals.map((goal) => goal.id))
	const goalTransactions = $derived(
		transactionStore.data.filter((transaction) => goalIds.includes(transaction.investment_id)),
	)

	const investmentIds = $derived(regularInvestments.map((investment) => investment.id))
	const investmentTransactions = $derived(
		transactionStore.data.filter((transaction) =>
			investmentIds.includes(transaction.investment_id),
		),
	)

	// Calculate goals data when goals change (only if feature enabled)
	$effect(() => {
		// Explicitly reference dependencies to ensure Svelte tracks them
		const currentGoals = goals
		const currentTransactions = goalTransactions

		if (portfolio && !isLoading && goalsFeatureEnabled) {
			setTimeout(() => {
				goalsSimulation.calculateIteratively(portfolio, currentGoals, currentTransactions)
			}, 0)
		}
	})

	// Calculate investments data when investments change (always, but filters out goals if feature enabled)
	$effect(() => {
		// Explicitly reference dependencies to ensure Svelte tracks them
		const currentInvestments = regularInvestments
		const currentTransactions = investmentTransactions

		if (portfolio && !isLoading) {
			setTimeout(() => {
				investmentsSimulation.calculateIteratively(
					portfolio,
					currentInvestments,
					currentTransactions,
				)
			}, 0)
		}
	})

	// Switch between goal and investment data based on selected tab (or just investments if feature disabled)
	const investments = $derived(
		goalsFeatureEnabled && selectedTab === 'goals' ? goals : regularInvestments,
	)

	const graphData = $derived(
		goalsFeatureEnabled && selectedTab === 'goals'
			? goalsSimulation.simulationData
			: investmentsSimulation.simulationData,
	)

	const transactions = $derived(
		goalsFeatureEnabled && selectedTab === 'goals' ? goalTransactions : investmentTransactions,
	)

	// Check if portfolio is empty - when goals enabled, check both goals and investments; otherwise just investments
	const hasAnyInvestments = $derived(
		goalsFeatureEnabled
			? goals.length > 0 || regularInvestments.length > 0
			: regularInvestments.length > 0,
	)

	const investmentsViewStore = $derived(
		withInvestmentsViewStore(investmentStore.filter(portfolioId)),
	)

	const isLoading = $derived(
		clientStore.loading ||
			portfolioStore.loading ||
			investmentStore.loading ||
			transactionStore.loading,
	)

	let adjustWithInflation = $state(false)
	let isGraphFullscreened = $state(false)
	let isSidebarOpen = $state(true)
	const isSidebarFlexible = $derived(layoutStore.mobile)

	let isHeaderHovered = $state(false)
	let isMenuOpen = $state(false)
	let isShareMenuOpen = $state(false)
	const isPortfolioMenuOpen = $derived(isMenuOpen || isShareMenuOpen)
	let parentContainer: HTMLElement | undefined = $state()

	$effect(() => {
		investmentsViewStore.allInvestments = investments
	})

	$effect(() => {
		if (!isGraphFullscreened) isSidebarOpen = true
	})

	$effect(() => {
		switch (page.url.hash) {
			case '#investments': {
				selectedTab = 'investments'
				return
			}
			case '#goals': {
				selectedTab = 'goals'
				return
			}
		}
	})

	function addInvestment() {
		goto(routes.NEW_INVESTMENT(clientId, portfolioId))
	}
</script>

{#snippet emptyPage()}
	<section class="empty">
		<img src={`${base}/images/no-investment.svg`} alt={$_('common.noInvestmentsYet')} />
		<div class="spacer"></div>
		<Typography variant="h4">{$_('page.portfolio.noInvestmentYet')}</Typography>
		<Typography>{$_('page.portfolio.createYourFirstInvestment')}</Typography>
		<div class="spacer"></div>
		<Button variant="strong" dimension="compact" onclick={addInvestment}
			>{$_('page.portfolio.addInvestment')}</Button
		>
	</section>
{/snippet}

{#snippet sidebarButton()}
	<Button
		variant="ghost"
		dimension="compact"
		onclick={() => {
			isSidebarOpen = !isSidebarOpen
		}}
		>{#if isSidebarOpen}<SidePanelCloseFilled size={20} />{:else}<SidePanelOpenFilled
				size={20}
			/>{/if}</Button
	>
{/snippet}

{#if isLoading}
	<ContentLayout centerVertical>
		<Loader />
	</ContentLayout>
{:else if !portfolio || !client}
	<ContentLayout centerVertical>
		404 - {$_('common.notFound')}
		{portfolio ? 'portfolio' : 'no portfolio'}
		{client ? 'client' : 'no client'}
	</ContentLayout>
{:else if !hasAnyInvestments}
	{@render emptyPage()}
{:else}
	<DesktopOnly>
		<main
			class:fullscreen-graph={isGraphFullscreened}
			class:sidebar-open={isSidebarOpen && isGraphFullscreened}
			class="fixed-height"
			onmouseenter={() => (isHeaderHovered = false)}
			onmouseleave={() => (isHeaderHovered = true)}
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="header-container"
				class:visible={isHeaderHovered || isPortfolioMenuOpen}
				onmouseenter={() => (isHeaderHovered = true)}
				onmouseleave={() => (isHeaderHovered = false)}
			>
				<PortfolioHeader
					{client}
					{portfolio}
					{investments}
					back={() => goto(routes.CLIENT(clientId))}
					bind:adjustWithInflation
					bind:isMenuOpen
					bind:isShareMenuOpen
				/>
			</div>

			<section class="horizontal grower fixed-height">
				{#if isSidebarOpen}
					<PortfolioSidebar
						{client}
						{portfolio}
						{goals}
						{regularInvestments}
						{investments}
						{isGraphFullscreened}
						{isSidebarFlexible}
						bind:isSidebarOpen
						{investmentsViewStore}
						{graphData}
						{adjustWithInflation}
						{goalsFeatureEnabled}
						bind:selectedTab
						transactionCount={transactions.length}
						{clientId}
						{portfolioId}
					/>
				{/if}
				<PortfolioGraph
					bind:isSidebarOpen
					{isGraphFullscreened}
					fullscreen={() => {
						isGraphFullscreened = !isGraphFullscreened
						if (isGraphFullscreened) {
							isSidebarOpen = false
						}
					}}
					{portfolio}
					{investments}
					simulationData={graphData}
					bind:adjustWithInflation
					{investmentsViewStore}
					isEmpty={transactions.length === 0}
					clientBirthDate={client?.birth_date ? new Date(client.birth_date) : undefined}
					{sidebarButton}
					disableInteraction={graphData.isCalculating}
				/>
			</section>
		</main>
	</DesktopOnly>
	<MobileOnly>
		<main class="mobile fixed-height">
			<Vertical
				--vertical-justify-content="space-between"
				--vertical-gap="0"
				class="grower fixed-height"
				bind:element={parentContainer}
			>
				<Vertical>
					<ContentLayout centered={false}>
						<PortfolioHeader
							{client}
							{portfolio}
							{investments}
							back={() => goto(routes.CLIENT(clientId))}
							bind:adjustWithInflation
							bind:isMenuOpen
							bind:isShareMenuOpen
						/>
					</ContentLayout>

					<PortfolioGraph
						isSidebarOpen={false}
						isGraphFullscreened={true}
						fullscreen={() => {
							isGraphFullscreened = !isGraphFullscreened
						}}
						fullscreenGraph="value"
						{portfolio}
						{investments}
						simulationData={graphData}
						bind:adjustWithInflation
						{investmentsViewStore}
						isEmpty={false}
						clientBirthDate={client?.birth_date ? new Date(client.birth_date) : undefined}
						disableInteraction={true}
					/>
					<PortfolioSidebar
						{client}
						{portfolio}
						{goals}
						{regularInvestments}
						{investments}
						{isGraphFullscreened}
						{isSidebarFlexible}
						bind:isSidebarOpen
						{investmentsViewStore}
						{graphData}
						{adjustWithInflation}
						{goalsFeatureEnabled}
						bind:selectedTab
						transactionCount={transactions.length}
						{clientId}
						{portfolioId}
						{parentContainer}
					/>
				</Vertical>
			</Vertical>
		</main>
	</MobileOnly>
{/if}

<style>
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
	.fullscreen-graph {
		min-height: calc(100vh - 50px);
		padding: 0;
		.horizontal {
			gap: 0;
		}
	}
	.sidebar-open {
		padding: 0;
		.horizontal {
			gap: var(--half-padding);
		}
	}
	.empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--half-padding);
		height: 80vh;
	}
	.spacer {
		margin-top: var(--half-padding);
	}
	:global(.mobile-investment-header) {
		box-shadow: 0px 1px 4px 0px #00000040;
		z-index: 1;
	}
	:global(.fixed-height) {
		height: calc(100dvh - var(--header-height));
		overflow-y: hidden;
	}
	.header-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background-color: var(--colors-ultra-low);
		padding: var(--double-padding);
		box-shadow: 0px 1px 4px 0px #00000040;
		transform: translateY(-100%);
		opacity: 0;
		transition:
			transform 0.3s ease-in-out,
			opacity 0.3s ease-in-out;
		pointer-events: none;
	}
	.header-container.visible {
		transform: translateY(0);
		opacity: 1;
		pointer-events: auto;
	}
</style>
