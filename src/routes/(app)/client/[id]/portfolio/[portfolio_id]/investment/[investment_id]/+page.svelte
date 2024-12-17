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
	import PortfolioHeader from '$lib/components/portfolio-header.svelte'
	import InvestmentGraph from '$lib/components/graph-investment.svelte'

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

	function goBack() {
		goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))
	}

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

{#if !portfolio || !client || !investment}
	404 Not found
{:else}
	<main>
		<PortfolioHeader {client} {portfolio} />
		<section class="horizontal grower">
			<section class="sidebar vertical">
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
					<section class="horizontal investment">
						<Button dimension="small" variant="ghost" onclick={goBack}
							><ArrowLeft size={16} /></Button
						>
						<Typography variant="h5">{investment.name}</Typography>
						<div class="grower"></div>
						<Button dimension="small" variant="solid" onclick={editInvestment}
							><SettingsEdit size={16} /></Button
						>
					</section>
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
									{#if deposits.length === 0}
										<img src="/images/pets-21.png" alt="No deposit yet" />
										<section class="vertical centered">
											<Typography variant="h5">{$_('No deposit yet')}</Typography>
											<Typography variant="small"
												>{$_('Create a first deposit in this investment')}</Typography
											>
										</section>
									{/if}
									{#each deposits as deposit}
										<TransactionCard
											transaction={deposit}
											currency={portfolio.currency}
											open={() => openTransaction(deposit)}
										/>
									{/each}
								</section>
								<Button dimension="small" variant="strong" onclick={addDeposit}>
									<Add size={16} />{$_('Add deposit')}</Button
								>
							</TabContent>
							<TabContent id="withdrawal">
								{#snippet value()}
									<Export size={16} />
									Withdrawals
								{/snippet}
								<section class="transactions vertical">
									{#if deposits.length === 0}
										<img src="/images/pets-29.png" alt="No withdrawal yet" />
										<section class="vertical centered">
											<Typography variant="h5">{$_('No withdrawal yet')}</Typography>
											<Typography variant="small"
												>{$_('Create a first withdrawal in this investment')}</Typography
											>
										</section>
									{/if}
									{#each withdrawals as withdrawal}
										<TransactionCard
											transaction={withdrawal}
											currency={portfolio.currency}
											open={() => openTransaction(withdrawal)}
										/>
									{/each}
									<Button dimension="small" variant="strong" onclick={addWithdrawal}>
										<Add size={16} />{$_('Add withdrawal')}</Button
									>
								</section>
							</TabContent>
						</TabBar>
					</section>
				{/if}
			</section>
			<InvestmentGraph
				{investment}
				investmentData={transactionStore.filter(investmentId)}
				{portfolio}
			/>
		</section>
	</main>
{/if}

<style>
	:root {
		--max-width: 1370px;
		--sidebar-width: 320px;
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
		gap: 0;
	}
	:global(.grower) {
		flex: 1;
	}
	.sidebar {
		width: var(--sidebar-width);
		border-right: 1px solid var(--colors-low);
		height: 100%;
	}
	.investment {
		padding: var(--half-padding) var(--padding);
		border-bottom: 1px solid var(--colors-low);
	}
	.tabs {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: var(--padding);
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
		gap: var(--half-padding);
		justify-content: center;
		padding-top: var(--padding);
		padding-bottom: var(--padding);
	}
	.dialog {
		margin: var(--half-padding);
		padding: var(--padding);
		border-radius: var(--border-radius);
		background-color: var(--colors-ultra-low);
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
		background-color: var(--colors-dark-overlay);
	}
	.centered {
		align-items: center;
	}
</style>
