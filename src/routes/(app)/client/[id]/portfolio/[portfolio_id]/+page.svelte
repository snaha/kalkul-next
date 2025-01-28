<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { Add, UserFollow } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Loader from '$lib/components/ui/loader.svelte'
	import routes from '$lib/routes'
	import { page } from '$app/stores'
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

	const clientId = parseInt($page.params.id, 10)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = parseInt($page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	const investments = $derived(investmentStore.filter(portfolioId))

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
</script>

{#if isLoading}
	<Fullscreen>
		<Loader />
	</Fullscreen>
{:else if !portfolio || !client}
	<Fullscreen>
		404 - {$_('Not found')}
	</Fullscreen>
{:else}
	<PortfolioHeader
		{client}
		{portfolio}
		{investments}
		back={() => goto(routes.CLIENT(clientId))}
		bind:adjustWithInflation
	/>
	{#if investments.length === 0}
		<section class="empty">
			<img src="/images/no-investment.svg" alt="No investments yet" />
			<div class="spacer"></div>
			<Typography variant="h4">{$_('noInvestmentYet')}</Typography>
			<Typography>{$_('createYourFirstInvestment')}</Typography>
			<div class="spacer"></div>
			<Button variant="strong" onclick={addInvestment}><UserFollow />{$_('addInvestment')}</Button>
		</section>
	{:else}
		<main>
			<section class="horizontal grower">
				<Sidebar --sidebar-gap="var(--padding)" --sidebar-padding="0">
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
							<InvestmentCard {investment} {portfolio} index={i} {openTransaction} />
						{/each}
					</section>
					<Button dimension="compact" variant="solid" onclick={addInvestment}>
						<Add size={24} /></Button
					>
				</Sidebar>
				<PortfolioGraph {portfolio} {investments} {adjustWithInflation} />
			</section>
		</main>
	{/if}
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
