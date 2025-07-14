<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { Add, SidePanelCloseFilled, SidePanelOpenFilled, UserFollow } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Loader from '$lib/components/ui/loader.svelte'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { goto } from '$app/navigation'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import InvestmentCard from '$lib/components/investment-card.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import PortfolioHeader from '$lib/components/portfolio-header.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import PortfolioGraph from '$lib/components/graph-portfolio.svelte'
	import Sidebar from '$lib/components/sidebar.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import type { Investment, InvestmentWithColorIndex, Transaction } from '$lib/types'
	import EditTransaction from '$lib/components/edit-transaction.svelte'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import { withInvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import { base } from '$app/paths'
	import HelpBox from '$lib/components/help-box.svelte'

	const clientId = $derived(parseInt(page.params.id, 10))
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = $derived(parseInt(page.params.portfolio_id, 10))
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	const investments = $derived(investmentStore.filter(portfolioId))

	const investmentsViewStore = $derived(
		withInvestmentsViewStore(investmentStore.filter(portfolioId)),
	)

	let isLoading = $derived(
		clientStore.loading ||
			portfolioStore.loading ||
			investmentStore.loading ||
			transactionStore.loading,
	)

	let adjustWithInflation = $state(false)

	function addInvestment() {
		goto(routes.NEW_INVESTMENT(clientId, portfolioId))
	}

	let dialog: HTMLDialogElement | undefined = $state()
	let editedTransaction: Transaction | undefined = $state()
	let selectedInvestment: Investment | undefined = $state()

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
	$effect(() => {
		investmentsViewStore.allInvestments = investments
	})

	let isGraphFullscreened = $state(false)
	let isSidebarOpen = $state(true)

	$effect(() => {
		if (!isGraphFullscreened) isSidebarOpen = true
	})
</script>

{#if isLoading}
	<Fullscreen>
		<Loader />
	</Fullscreen>
{:else if !portfolio || !client}
	<Fullscreen>
		404 - {$_('common.notFound')}
	</Fullscreen>
{:else}
	{#if !isGraphFullscreened}
		<PortfolioHeader
			{client}
			{portfolio}
			{investments}
			back={() => goto(routes.CLIENT(clientId))}
			bind:adjustWithInflation
		/>
	{/if}
	{#if investments.length === 0}
		<section class="empty">
			<img src={`${base}/images/no-investment.svg`} alt="No investments yet" />
			<div class="spacer"></div>
			<Typography variant="h4">{$_('page.portfolio.noInvestmentYet')}</Typography>
			<Typography>{$_('page.portfolio.createYourFirstInvestment')}</Typography>
			<div class="spacer"></div>
			<Button variant="strong" onclick={addInvestment}
				><UserFollow />{$_('page.portfolio.addInvestment')}</Button
			>
		</section>
	{:else}
		<main
			class:fullscreen-graph={isGraphFullscreened}
			class:sidebar-open={isSidebarOpen && isGraphFullscreened}
		>
			<div class="sidebar-toggle-button">
				<Button variant="ghost" dimension="small" onclick={() => (isSidebarOpen = !isSidebarOpen)}>
					{#if isSidebarOpen}
						<SidePanelCloseFilled size={16} />
					{:else}
						<SidePanelOpenFilled size={16} />
					{/if}
				</Button>
			</div>
			<section class="horizontal grower">
				<Sidebar
					--sidebar-gap="var(--padding)"
					--sidebar-padding="0"
					{isGraphFullscreened}
					{isSidebarOpen}
				>
					<dialog bind:this={dialog}>
						<div class="dialog-background">
							<section class="vertical dialog">
								{#if selectedInvestment !== undefined}
									<EditTransaction
										investment={selectedInvestment}
										{portfolio}
										{client}
										transaction={editedTransaction}
										close={closeDialog}
									/>
								{/if}
							</section>
						</div>
					</dialog>
					<section class="investments" class:hidden={selectedInvestment !== undefined}>
						{#each investments as investment, i}
							<InvestmentCard
								{investment}
								{portfolio}
								index={i}
								hidden={investmentsViewStore.isHidden(investment.id)}
								focused={investmentsViewStore.isFocused(investment.id) && investments.length > 1}
								{openTransaction}
								toggleHide={() => {
									investmentsViewStore.toggleHide(investment.id)
								}}
								toggleFocus={() => {
									investmentsViewStore.toggleFocus(investment.id)
								}}
								open={investments.length === 1}
							/>
						{/each}
					</section>
					<Button dimension="compact" variant="solid" onclick={addInvestment}>
						<Add size={24} /></Button
					>
				</Sidebar>
				<PortfolioGraph
					{isSidebarOpen}
					{isGraphFullscreened}
					fullscreen={() => {
						isGraphFullscreened = !isGraphFullscreened
					}}
					{portfolio}
					{investments}
					bind:adjustWithInflation
					{investmentsViewStore}
				/>
			</section>
		</main>
	{/if}
	{#if investmentStore.data.length === 0}
		<HelpBox
			open={investmentStore.data.length === 0}
			title={$_('Add investment')}
			boxText={$_('Press the “Add investment” button to add a first investment in this portfolio')}
			text={$_(
				'You can create as many investments as you want in a client portfolio. Once you have at least one investment set up, this page will display detailed information about the whole portfolio.',
			)}
		></HelpBox>
	{:else}
		<HelpBox
			open={investmentStore.data.length === 1 && transactionStore.data.length === 0}
			title={$_('Add a transaction')}
			boxText={$_(
				'In the left sidebar, press the “Add transaction” button within the desired investment card.',
			)}
			text={$_(
				'Transactions define the amount of money that is deposited or withdrawn for this specific investment over time.',
			)}
		></HelpBox>
	{/if}
{/if}

<style>
	.sidebar-toggle-button {
		position: absolute;
		top: var(--padding);
		left: var(--padding);
		z-index: 1;
		opacity: 0;
		visibility: hidden;
	}
	:root {
		--max-width: 1370px;
	}
	main {
		position: relative;
		min-height: calc(100vh - 180px);
		display: flex;
		flex-direction: column;
		padding: var(--double-padding);
		gap: var(--double-padding);
		transition: padding 0.3s ease-in;
		overflow: hidden;
	}

	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: stretch;
		gap: var(--padding);
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
		.sidebar-toggle-button {
			opacity: 1;
			transition: opacity 0.3s ease-in 0.3s;
			visibility: visible;
		}
	}
	.sidebar-open {
		padding: 0 0 0 var(--padding);
		.horizontal {
			gap: var(--padding);
		}
	}
	.investments {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		&.hidden {
			display: none;
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
	.dialog {
		padding: var(--padding);
		border-radius: var(--border-radius);
		background-color: var(--colors-ultra-low);
		border: 1px solid var(--colors-low);
	}
	dialog {
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		position: relative;
		border: 0;
		margin: 0;
		z-index: 1;
		padding: 0;
		width: 0;
		height: 100%;
	}
	.dialog-background {
		position: absolute;
		width: var(--sidebar-width);
		height: 100%;
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0;
	}
</style>
