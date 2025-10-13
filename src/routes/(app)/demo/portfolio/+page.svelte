<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { Add, ArrowLeft, SidePanelCloseFilled, SidePanelOpenFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { demoStore, goalToTransactions, goalToInvestment } from '$lib/demo/stores/demo.svelte'
	import { DEMO_CLIENT_NAME, DEMO_CLIENT_BIRTH_DATE, DEMO_CLIENT_EMAIL } from '$lib/demo/utils'
	import PortfolioHeader from '$lib/components/portfolio-header.svelte'
	import PortfolioGraph from '$lib/components/graph-portfolio.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import type { InvestmentWithColorIndex, Transaction } from '$lib/types'
	import { withInvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import MobileOnly from '$lib/components/mobile-only.svelte'
	import DesktopOnly from '$lib/components/desktop-only.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import InvestmentsSidebar from '$lib/demo/components/investments-sidebar.svelte'
	import type { PortfolioSimulation } from '$lib/stores/portfolio-simulation.svelte'
	import TabBar from '$lib/components/ui/tab-bar/tab-bar.svelte'
	import TabContent from '$lib/components/ui/tab-bar/tab-content.svelte'
	import GoalsSidebar from '$lib/demo/components/goals-sidebar.svelte'

	// Import pre-calculated graph data for demo states
	import goalOnlyData from '$lib/demo/data/1-goal-only-graph-data.json'
	import singleInvestmentData from '$lib/demo/data/2-single-investment-graph-data.json'
	import equalInvestmentsData from '$lib/demo/data/3-equal-investments-graph-data.json'
	import finalData from '$lib/demo/data/4-final-graph-data.json'

	// Demo mode - use mock client matching Client type
	const client = {
		id: -1,
		name: DEMO_CLIENT_NAME,
		birth_date: DEMO_CLIENT_BIRTH_DATE,
		advisor: '',
		created_at: new Date().toISOString(),
		email: DEMO_CLIENT_EMAIL,
	}

	// Initialize demo portfolio if not already initialized
	$effect(() => {
		if (!demoStore.portfolio) {
			const currency = demoStore.goals[0]?.currency ?? 'EUR'
			demoStore.initializeDemoPortfolio(-1, currency)
			// Set to state 1 only on initial load
			demoStore.setState(1)
		}
	})

	// Use demo data - no DB fetching
	const portfolio = $derived(demoStore.portfolio)
	const investments = $derived(demoStore.investments)
	const transactions = $derived(demoStore.transactions)
	const goals = $derived(demoStore.goals)
	const transactionGoalMap = $derived(demoStore.transactionGoalMap)

	// Track selected tab
	let selectedTab = $state<'goals' | 'investments'>('goals')

	// Prepare goal data
	const currentGoal = $derived(demoStore.goals[0])
	const goalInvestments = $derived(
		currentGoal
			? [{ ...goalToInvestment(currentGoal), colorIndex: 4 } as InvestmentWithColorIndex]
			: [],
	)
	const goalTransactions = $derived(currentGoal ? goalToTransactions(currentGoal) : [])

	/**
	 * Gets hardcoded graph data based on the current demo state.
	 * Returns undefined if no hardcoded data is available for the current state.
	 */
	function getHardcodedGraphData(): PortfolioSimulation | undefined {
		const state = demoStore.demoState

		switch (state) {
			case 1:
				return goalOnlyData as PortfolioSimulation
			case 2:
				return singleInvestmentData as PortfolioSimulation
			case 3:
				return equalInvestmentsData as PortfolioSimulation
			case 4:
				return finalData as PortfolioSimulation
			default:
				return undefined
		}
	}

	// Empty simulation data structure
	const emptySimulationData: PortfolioSimulation = {
		data: [],
		total: {
			label: 'Total',
			graphLabels: [],
			graphDeposits: [],
			graphWithdrawals: [],
			graphInvestmentValues: [],
			graphFeeValues: [],
			graphInflationDeposits: [],
			graphInflationWithdrawals: [],
			graphInflationInvestmentValues: [],
			graphInflationFeeValues: [],
		},
		isCalculating: false,
		progress: 100,
	}

	// Get data based on selected tab - always use hardcoded data or empty
	const graphInvestments = $derived(selectedTab === 'goals' ? goalInvestments : investments)
	const graphTransactions = $derived(selectedTab === 'goals' ? goalTransactions : transactions)

	// Always use hardcoded data, never calculate
	const graphData = $derived.by(() => {
		const hardcodedData = getHardcodedGraphData()
		if (!hardcodedData) return emptySimulationData

		if (selectedTab === 'goals') {
			if (investments.length > 0) {
				// Show total from hardcoded investments simulation
				return {
					data: [hardcodedData.total],
					total: hardcodedData.total,
					isCalculating: false,
					progress: 100,
				}
			} else {
				// No investments, show hardcoded goal-only simulation
				return hardcodedData
			}
		} else {
			// Investments tab - use hardcoded data
			return hardcodedData
		}
	})

	const investmentsViewStore = $derived(withInvestmentsViewStore(investments))

	// Tab labels
	const goalsTabLabel = $_('page.goals.title')
	const investmentsTabLabel = $_('common.investments')

	let adjustWithInflation = $state(true)
	let dialog: HTMLDialogElement | undefined = $state()
	let editedTransaction: Transaction | undefined = $state()
	let selectedInvestment: InvestmentWithColorIndex | undefined = $state()
	const mobileScreen: 'chart' | 'investments' = $derived(
		page.url.hash === '#investments' ? 'investments' : 'chart',
	)
	let isGraphFullscreened = $state(false)
	let isSidebarOpen = $state(true)
	const isSidebarFlexible = $derived(layoutStore.mobile)
	let isHeaderHovered = $state(false)
	let isMenuOpen = $state(false)
	let isShareMenuOpen = $state(false)
	const isPortfolioMenuOpen = $derived(isMenuOpen || isShareMenuOpen)

	$effect(() => {
		investmentsViewStore.allInvestments = investments
	})

	$effect(() => {
		if (!isGraphFullscreened) isSidebarOpen = true
	})

	function addInvestment() {
		goto(routes.DEMO_NEW_INVESTMENT())
	}

	function openTransaction(investment: InvestmentWithColorIndex, transaction?: Transaction) {
		selectedInvestment = investment
		if (transaction) editedTransaction = transaction

		dialog?.show()
	}

	function closeDialog() {
		editedTransaction = undefined
		selectedInvestment = undefined

		dialog?.close()
	}

	function handleEditInvestment(investmentId: number) {
		goto(routes.DEMO_EDIT_INVESTMENT(investmentId))
	}

	async function handleDeleteInvestment(investmentId: number) {
		demoStore.deleteInvestment(investmentId)
	}

	// DEMO: Keyboard listeners to set demo states
	$effect(() => {
		function handleKeydown(event: KeyboardEvent) {
			// ArrowRight: State 3 - Equal weights (25% each)
			if (event.key === 'ArrowRight') {
				demoStore.setState(3)
			}
			// ArrowDown: State 4 - Custom weights (15%, 24%, 51%, 10%)
			else if (event.key === 'ArrowDown') {
				demoStore.setState(4)
			}
		}

		window.addEventListener('keydown', handleKeydown)

		return () => {
			window.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

{#snippet investmentSidebar()}
	{#if client && portfolio}
		<Vertical --vertical-gap="0" class="sidebar-tabs-container">
			<TabBar
				bind:selectedTabId={selectedTab}
				ulClass="account-tabbar"
				liClass="account-tab-li"
				buttonClass="account-tab-button"
			>
				<TabContent value={goalsTabLabel} id="goals">
					<GoalsSidebar
						{isGraphFullscreened}
						{isSidebarFlexible}
						bind:isSidebarOpen
						{editedTransaction}
						{selectedInvestment}
						{client}
						{portfolio}
						{goals}
						{adjustWithInflation}
						viewOnly={false}
						{graphData}
						{closeDialog}
						{openTransaction}
						{addInvestment}
					/>
				</TabContent>

				<TabContent
					value={investmentsTabLabel}
					id="investments"
					disabled={investments.length === 0}
				>
					<InvestmentsSidebar
						{isGraphFullscreened}
						{isSidebarFlexible}
						bind:isSidebarOpen
						{editedTransaction}
						{selectedInvestment}
						{client}
						{portfolio}
						{investments}
						{investmentsViewStore}
						{adjustWithInflation}
						viewOnly={false}
						{graphData}
						{closeDialog}
						{openTransaction}
						{addInvestment}
						{transactions}
						onEditInvestment={handleEditInvestment}
						onDeleteInvestment={handleDeleteInvestment}
						{transactionGoalMap}
					/>
				</TabContent>
			</TabBar>
		</Vertical>
	{/if}
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

{#if !client}
	<ContentLayout>
		404 - {$_('common.notFound')}
	</ContentLayout>
{:else if !portfolio}
	<!-- Waiting for demo portfolio initialization -->
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
					back={() => goto(routes.DEMO_TEMPLATES)}
					bind:adjustWithInflation
					bind:isMenuOpen
					bind:isShareMenuOpen
					simulationData={graphData}
				/>
			</div>

			<section class="horizontal grower fixed-height">
				{#if isSidebarOpen}
					<div class="vertical scrollable">
						{@render investmentSidebar()}
					</div>
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
					investments={graphInvestments}
					simulationData={graphData}
					bind:adjustWithInflation
					{investmentsViewStore}
					isEmpty={graphTransactions.length === 0}
					clientBirthDate={client?.birth_date ? new Date(client.birth_date) : undefined}
					{sidebarButton}
				/>
			</section>
		</main>
	</DesktopOnly>
	<MobileOnly>
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
							<div class="grower"></div>
							<Button variant="ghost" dimension="compact" onclick={addInvestment}
								><Add size={20} /></Button
							>
						</Horizontal>
					</ContentLayout>
					{@render investmentSidebar()}
					<div class="grower"></div>
				{:else if mobileScreen === 'chart'}
					<ContentLayout centered={false}>
						<PortfolioHeader
							{client}
							{portfolio}
							{investments}
							back={() => goto(routes.DEMO_TEMPLATES)}
							bind:adjustWithInflation
							bind:isMenuOpen
							bind:isShareMenuOpen
							simulationData={graphData}
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
						investments={graphInvestments}
						simulationData={graphData}
						bind:adjustWithInflation
						{investmentsViewStore}
						isEmpty={graphTransactions.length === 0}
						clientBirthDate={client?.birth_date ? new Date(client.birth_date) : undefined}
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
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0;
	}
	:global(.mobile-investment-header) {
		box-shadow: 0px 1px 4px 0px #00000040;
		z-index: 1;
	}
	.scrollable {
		overflow-y: auto;
		max-height: 100%;
		background-color: var(--colors-low);
	}
	.fixed-height {
		height: calc(100dvh - var(--header-height));
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
	:global(.sidebar-tabs-container) {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	:global(.account-tabbar) {
		justify-content: space-between;
		background-color: var(--colors-base);
		border: 1px solid var(--colors-low);
		gap: var(--quarter-padding);
		border-radius: var(--quarter-padding);
		padding: var(--quarter-padding) !important;
		margin: var(--half-padding) !important;
	}
	:global(.account-tab-li) {
		display: flex;
		flex: 1;
	}
	:global(.account-tab-button) {
		flex-grow: 1 !important;
	}
</style>
