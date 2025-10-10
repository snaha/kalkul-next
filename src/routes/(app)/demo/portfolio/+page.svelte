<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { Add, ArrowLeft, SidePanelCloseFilled, SidePanelOpenFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { untrack } from 'svelte'
	import { demoStore, goalToTransactions, goalToInvestment } from '$lib/demo/stores/demo.svelte'
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
	import { withPortfolioSimulationStore } from '$lib/stores/portfolio-simulation.svelte'
	import TabBar from '$lib/components/ui/tab-bar/tab-bar.svelte'
	import TabContent from '$lib/components/ui/tab-bar/tab-content.svelte'
	import GoalsSidebar from '$lib/demo/components/goals-sidebar.svelte'

	// Demo mode - use mock client matching Client type
	const client = {
		id: -1,
		name: 'Demo' + ' ' + 'Client', // Internal: not user-facing
		birth_date: '1990-01-01',
		advisor: '',
		created_at: new Date().toISOString(),
		email: 'demo@example.com',
	}

	// Initialize demo portfolio if not already initialized
	$effect(() => {
		if (!demoStore.portfolio) {
			const currency = demoStore.goals[0]?.currency ?? 'EUR'
			demoStore.initializeDemoPortfolio(-1, currency)
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
	const goalInvestments = $derived(currentGoal ? [goalToInvestment(currentGoal)] : [])
	const goalTransactions = $derived(currentGoal ? goalToTransactions(currentGoal) : [])

	// Create two separate simulation stores
	const goalsSimulation = withPortfolioSimulationStore()
	const investmentsSimulation = withPortfolioSimulationStore()

	// Calculate both simulations
	$effect(() => {
		if (portfolio && goalTransactions.length > 0) {
			untrack(() => {
				goalsSimulation.calculateIteratively(portfolio, goalInvestments, goalTransactions)
			})
		}
	})

	$effect(() => {
		if (portfolio && transactions) {
			untrack(() => {
				investmentsSimulation.calculateIteratively(portfolio, investments, transactions)
			})
		}
	})

	// Get data based on selected tab
	const graphInvestments = $derived(selectedTab === 'goals' ? goalInvestments : investments)
	const graphTransactions = $derived(selectedTab === 'goals' ? goalTransactions : transactions)
	const graphData = $derived(
		selectedTab === 'goals' ? goalsSimulation.simulationData : investmentsSimulation.simulationData,
	)

	const investmentsViewStore = $derived(withInvestmentsViewStore(investments))

	// Tab labels
	const goalsTabLabel = $_('page.goals.title')
	const investmentsTabLabel = $_('common.investments')

	let adjustWithInflation = $state(false)
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

	// DEMO: Prefill investments for demonstration
	function addDemoInvestments() {
		// Clear all existing investments
		demoStore.investments = []
		demoStore.transactions = []
		demoStore.transactionGoalMap = new Map()

		// Clear linked investments from goals
		demoStore.goals.forEach((goal) => {
			goal.linkedInvestments = []
		})

		// DEMO PREFILL VALUES - Add predefined investments
		demoStore.addInvestment({
			portfolio_id: -1,
			name: 'Eurizon AM Slovakia – Akciové Portfólio',
			apy: 7.2,
			type: 'mutual_fund',
			advanced_fees: false,
			entry_fee: null,
			entry_fee_type: null,
			exit_fee: null,
			exit_fee_type: null,
			management_fee: null,
			management_fee_type: null,
			success_fee: null,
			ter: null,
		})

		demoStore.addInvestment({
			portfolio_id: -1,
			name: 'Americký akciový fond (Tatra banka)',
			apy: 8.68,
			type: 'mutual_fund',
			advanced_fees: false,
			entry_fee: null,
			entry_fee_type: null,
			exit_fee: null,
			exit_fee_type: null,
			management_fee: null,
			management_fee_type: null,
			success_fee: null,
			ter: null,
		})

		demoStore.addInvestment({
			portfolio_id: -1,
			name: 'TAM – Dlhopisový fond',
			apy: 3.55,
			type: 'bond',
			advanced_fees: false,
			entry_fee: null,
			entry_fee_type: null,
			exit_fee: null,
			exit_fee_type: null,
			management_fee: null,
			management_fee_type: null,
			success_fee: null,
			ter: null,
		})

		demoStore.addInvestment({
			portfolio_id: -1,
			name: 'Zlato',
			apy: 5.35,
			type: 'commodity',
			advanced_fees: false,
			entry_fee: null,
			entry_fee_type: null,
			exit_fee: null,
			exit_fee_type: null,
			management_fee: null,
			management_fee_type: null,
			success_fee: null,
			ter: null,
		})
	}

	// DEMO: Keyboard listener to prefill investments for demonstration
	$effect(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'ArrowRight') {
				addDemoInvestments()
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

				<TabContent value={investmentsTabLabel} id="investments">
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
