<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import {
		Add,
		ArrowLeft,
		Rocket,
		SidePanelCloseFilled,
		SidePanelOpenFilled,
	} from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Loader from '$lib/components/ui/loader.svelte'
	import routes, { getStartedSections } from '$lib/routes'
	import { page } from '$app/state'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { goto } from '$app/navigation'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import PortfolioHeader from '$lib/components/portfolio-header.svelte'
	import PortfolioGraph from '$lib/components/graph-portfolio.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import type { InvestmentWithColorIndex, Transaction } from '$lib/types'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import { withInvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import { base } from '$app/paths'
	import HelpBox from '$lib/components/help-box.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import MobileOnly from '$lib/components/mobile-only.svelte'
	import DesktopOnly from '$lib/components/desktop-only.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import InvestmentsSidebar from '$lib/components/investments-sidebar.svelte'
	import { withPortfolioSimulationStore } from '$lib/stores/portfolio-simulation.svelte'

	const clientId = $derived(parseInt(page.params.id, 10))
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = $derived(parseInt(page.params.portfolio_id, 10))
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	const investments = $derived(investmentStore.filter(portfolioId))
	const investmentIds = $derived(investments.map((investment) => investment.id))
	const transactions = $derived(
		transactionStore.data.filter((transaction) =>
			investmentIds.includes(transaction.investment_id),
		),
	)

	const portfolioSimulation = withPortfolioSimulationStore()
	const graphData = $derived(portfolioSimulation.simulationData)

	// Recalculate when portfolio, investments, or transactions change
	$effect(() => {
		if (portfolio && !isLoading && transactions) {
			// setTimeout with 0 delay yields control to the browser, allowing:
			// 1. The UI to update (show loading state) before heavy calculations
			// 2. The browser to remain responsive during calculation
			setTimeout(() => {
				portfolioSimulation.calculateIteratively(portfolio, investments, transactions)
			}, 0)
		}
	})

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
		goto(routes.NEW_INVESTMENT(clientId, portfolioId))
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

{#snippet investmentSidebar()}
	{#if client && portfolio}
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
			transactionCount={transactions.length}
			{adjustWithInflation}
			viewOnly={false}
			{graphData}
			{closeDialog}
			{openTransaction}
			{addInvestment}
		/>
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

{#if isLoading}
	<ContentLayout>
		<Loader />
	</ContentLayout>
{:else if !portfolio || !client}
	<ContentLayout>
		404 - {$_('common.notFound')}
	</ContentLayout>
{:else}
	{#if investments.length === 0}
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
						{investments}
						simulationData={graphData}
						bind:adjustWithInflation
						{investmentsViewStore}
						isEmpty={transactions.length === 0}
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
							isEmpty={transactions.length === 0}
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
	{#if investments.length === 0}
		<HelpBox
			open={layoutStore.mobile ? false : true}
			title={$_('helpBox.addInvestmentTitle')}
			boxText={$_('helpBox.addInvestmentText')}
			text={$_('helpBox.investmentExplanation')}
		>
			<Button
				variant="strong"
				dimension="compact"
				href={`${routes.GET_STARTED}#${getStartedSections.ADD_INVESTMENT}`}
				target="_blank"><Rocket size={24} />{$_('component.help.checkQuickStartGuide')}</Button
			>
		</HelpBox>
	{:else if transactions.length === 0}
		<HelpBox
			open={layoutStore.mobile ? false : true}
			title={$_('helpBox.addTransactionTitle')}
			boxText={$_('helpBox.addTransactionText')}
			text={$_('helpBox.transactionExplanation')}
		>
			<Button
				variant="strong"
				dimension="compact"
				href={`${routes.GET_STARTED}#${getStartedSections.ADD_TRANSACTION}`}
				target="_blank"><Rocket size={24} />{$_('component.help.checkQuickStartGuide')}</Button
			>
		</HelpBox>
	{/if}
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
</style>
