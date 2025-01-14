<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { Add, ArrowLeft, SettingsEdit, Download, Export } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { page } from '$app/stores'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { goto } from '$app/navigation'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import TabBar from '$lib/components/ui/tab-bar/tab-bar.svelte'
	import TabContent from '$lib/components/ui/tab-bar/tab-content.svelte'
	import EditTransaction from '$lib/components/edit-transaction.svelte'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import TransactionCard from '$lib/components/transaction-card.svelte'
	import type { Transaction, TransactionType } from '$lib/types'
	import InvestmentGraph from '$lib/components/graph-investment.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import Sidebar from '$lib/components/sidebar.svelte'
	import FlexItem from '$lib/components/ui/flex-item.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'

	const clientId = parseInt($page.params.id, 10)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = parseInt($page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	const investments = $derived(investmentStore.filter(portfolioId))
	const investmentId = parseInt($page.params.investment_id, 10)
	const investment = $derived(investments.find((investment) => investment.id === investmentId))
	const deposits = $derived(
		transactionStore.filter(investmentId).filter((transaction) => transaction.type === 'deposit'),
	)
	const withdrawals = $derived(
		transactionStore
			.filter(investmentId)
			.filter((transaction) => transaction.type === 'withdrawal'),
	)

	let showDialog = $state(false)
	let dialogAction: TransactionType = $state('deposit')
	let dialog: HTMLDialogElement | undefined = $state()
	let editedTransaction: Transaction | undefined = $state()
	let isLoading = $derived(
		clientStore.loading ||
			portfolioStore.loading ||
			investmentStore.loading ||
			transactionStore.loading,
	)

	function addDeposit() {
		openDialog()
	}

	function addWithdrawal() {
		openDialog()
	}

	function openDialog() {
		showDialog = true

		dialog?.show()
	}

	function closeDialog() {
		showDialog = false
		editedTransaction = undefined

		dialog?.close()
	}

	function openTransaction(transaction: Transaction) {
		editedTransaction = transaction

		openDialog()
	}

	function editInvestment() {
		goto(routes.EDIT_INVESTMENT(clientId, portfolioId, investmentId))
	}
</script>

{#if isLoading}
	<Fullscreen>
		<Loader />
	</Fullscreen>
{:else if !portfolio || !client || !investment}
	404 Not found
{:else}
	<header class="horizontal top-bar">
		<Button
			dimension="compact"
			variant="ghost"
			onclick={() => {
				goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))
			}}
		>
			<ArrowLeft size={24} /></Button
		>
		<Typography variant="h4" bold>{investment.name}</Typography>
		<FlexItem />
		<Button variant="secondary" onclick={editInvestment}
			><SettingsEdit size={24} />{$_('Edit investment')}</Button
		>
	</header>
	<main>
		<section class="horizontal grower">
			<Sidebar>
				<dialog bind:this={dialog}>
					<div class="dialog-background">
						<section class="vertical dialog">
							{#if showDialog}
								<EditTransaction
									{investment}
									{portfolio}
									{client}
									transaction={editedTransaction || { type: dialogAction }}
									close={closeDialog}
								/>
							{/if}
						</section>
					</div>
				</dialog>
				{#if !showDialog}
					<section class="vertical tabs">
						<TabBar
							dimension="small"
							ulClass="investment-tab-controls"
							liClass="investment-tab-li"
							buttonClass="investment-tab-buttons"
							bind:selectedTabId={dialogAction}
						>
							<TabContent id="deposit">
								{#snippet value()}
									<Download size={16} />
									Deposits
								{/snippet}
								<section class="transactions vertical">
									<Button variant="strong" onclick={addDeposit}>
										<Add size={16} />{$_('Add deposit')}</Button
									>
									{#if deposits.length === 0}
										<section class="vertical centered">
											<img src="/images/add-deposit.svg" alt="No deposit yet" />
											<Typography variant="h5">{$_('No deposit yet')}</Typography>
											<Typography variant="small"
												>{$_('Use the button above to add one')}</Typography
											>
										</section>
									{/if}
									<Vertical --vertical-gap="var(--half-padding)">
										{#each deposits as deposit}
											<TransactionCard
												transaction={deposit}
												currency={portfolio.currency}
												open={() => openTransaction(deposit)}
											/>
										{/each}
									</Vertical>
								</section>
							</TabContent>
							<TabContent id="withdrawal">
								{#snippet value()}
									<Export size={16} />
									Withdrawals
								{/snippet}
								<section class="transactions vertical">
									<Button variant="strong" onclick={addWithdrawal}>
										<Add size={24} />{$_('Add withdrawal')}</Button
									>
									{#if withdrawals.length === 0}
										<section class="vertical centered">
											<img src="/images/add-withdrawal.svg" alt="No withdrawal yet" />
											<Typography variant="h5">{$_('No withdrawal yet')}</Typography>
											<Typography variant="small"
												>{$_('Create a first withdrawal in this investment')}</Typography
											>
										</section>
									{/if}
									<Vertical --vertical-gap="var(--half-padding)">
										{#each withdrawals as withdrawal}
											<TransactionCard
												transaction={withdrawal}
												currency={portfolio.currency}
												open={() => openTransaction(withdrawal)}
											/>
										{/each}
									</Vertical>
								</section>
							</TabContent>
						</TabBar>
					</section>
				{/if}
			</Sidebar>
			<InvestmentGraph {investment} {portfolio} />
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
		padding: var(--double-padding);
	}
	.top-bar {
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
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0;
	}
	:global(.grower) {
		flex: 1;
	}
	.tabs {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
	:global(.investment-tab-controls) {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly !important;
		background-color: var(--colors-base);
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		padding: var(--quarter-padding) !important;
	}
	:global(.investment-tab-li) {
		display: flex;
		flex: 1 !important;
	}
	:global(.investment-tab-buttons) {
		flex: 1 !important;
	}
	.transactions {
		gap: var(--padding);
		justify-content: center;
		padding-top: var(--padding);
		padding-bottom: var(--padding);
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
	.centered {
		align-items: center;
		padding: var(--padding);
	}
</style>
