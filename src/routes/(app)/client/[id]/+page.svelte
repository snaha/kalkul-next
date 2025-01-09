<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import {
		Add,
		ArrowLeft,
		Copy,
		Folder,
		FolderDetails,
		OverflowMenuVertical,
		Share,
		TrashCan,
		UserFollow,
		UserProfile,
	} from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import { formatDate } from '$lib/utils'
	import Avatar from '$lib/components/avatar.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import { page } from '$app/stores'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import List from '$lib/components/ui/list/list.svelte'
	import ListItem from '$lib/components/ui/list/list-item.svelte'
	import DeleteModal from '$lib/components/delete-modal.svelte'
	import { cascadeDeletePortfolio, cascadeDuplicatePortfolio } from '$lib/cascade'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { transactionStore } from '$lib/stores/transaction.svelte'

	const clientId = parseInt($page.params.id, 10)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolios = $derived(
		portfolioStore.data.filter((portfolio) => portfolio.client === clientId),
	)
	let showConfirmModal = $state(false)
	let portfolioToBeDeleted: number | undefined = $state()

	function addPortfolio() {
		goto(routes.CLIENT_NEW_PORTFOLIO(clientId))
	}

	function confirmDeletePortfolio(portfolioId: number) {
		portfolioToBeDeleted = portfolioId
		showConfirmModal = true
	}

	async function deletePortfolio() {
		if (!portfolioToBeDeleted) {
			return
		}

		await cascadeDeletePortfolio(portfolioToBeDeleted)
		portfolioToBeDeleted = undefined
		showConfirmModal = false
	}

	function numInvestments(portfolioId: number) {
		return investmentStore.filter(portfolioId).length
	}

	function totalPortfolioDeposits(portfolioId: number) {
		return investmentStore
			.filter(portfolioId)
			.reduce((prev, curr) => prev + totalInvestmentDeposits(curr.id), 0)
	}

	function totalInvestmentDeposits(investmentId: number) {
		return transactionStore
			.filter(investmentId)
			.reduce((prev, curr) => (curr.type === 'deposit' ? prev + curr.amount : prev), 0)
	}

	function totalPortfolioWithdrawals(portfolioId: number) {
		return investmentStore
			.filter(portfolioId)
			.reduce((prev, curr) => prev + totalInvestmentWithdrawals(curr.id), 0)
	}

	function totalInvestmentWithdrawals(investmentId: number) {
		return transactionStore
			.filter(investmentId)
			.reduce((prev, curr) => (curr.type === 'withdrawal' ? prev + curr.amount : prev), 0)
	}
</script>

{#snippet portfolioDropdown(portfolioId: number)}
	<Dropdown left buttonDimension="compact">
		{#snippet button()}
			<OverflowMenuVertical size={24} />
		{/snippet}
		<List>
			<ListItem onclick={() => goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))}
				><Folder size={24} />{$_('Open portfolio')}</ListItem
			>
			<ListItem onclick={() => goto(routes.SHARE(portfolioId))}
				><Share size={24} />{$_('Share portfolio')}</ListItem
			>
			<ListItem onclick={() => goto(routes.CLIENT_EDIT_PORTFOLIO(clientId, portfolioId))}
				><FolderDetails size={24} />{$_('Edit portfolio details')}</ListItem
			>
			<ListItem onclick={() => cascadeDuplicatePortfolio(clientId, portfolioId)}
				><Copy size={24} />{$_('Duplicate portfolio')}</ListItem
			>
			<ListItem onclick={() => confirmDeletePortfolio(portfolioId)}
				><TrashCan size={24} />{$_('Delete portfolio')}</ListItem
			>
		</List>
	</Dropdown>
{/snippet}

{#if !client}
	<Loader />
{:else}
	<section class="topbar horizontal">
		<Button
			dimension="compact"
			variant="ghost"
			onclick={() => {
				goto(routes.HOME)
			}}
		>
			<ArrowLeft size={24} /></Button
		>
		<Avatar size={48} name={client.name} birthDate={new Date(client.birth_date)} />
		<Typography variant="h4">{client.name}</Typography>
		<div class="grower"></div>
		<Button dimension="compact" variant="strong" onclick={addPortfolio}
			><Add size={24} />{$_('addPortfolio')}</Button
		>
		<Button
			dimension="compact"
			variant="secondary"
			onclick={() => goto(routes.EDIT_CLIENT(clientId))}
			><UserProfile size={24} />{$_('Edit client details')}</Button
		>
	</section>
	<main>
		{#if client}
			{#if portfolioStore.loading}
				<Typography>Loading...</Typography><Loader />
			{:else if portfolios.length === 0}
				<section class="empty">
					<img src="/images/no-portfolio.svg" alt="No portfolio yet" />
					<div class="spacer"></div>
					<Typography variant="h4">{$_('noPortfoliosYet')}</Typography>
					<Typography>{$_('createYourFirstPortfolio')}</Typography>
					<div class="spacer"></div>
					<Button variant="strong" onclick={addPortfolio}><UserFollow />{$_('addPortfolio')}</Button
					>
				</section>
			{:else}
				<ul>
					<li class="portfolios title">
						<span>{$_('portfolioName')}</span>
						<span>{$_('currency')}</span>
						<span>{$_('lastEdit')}</span>
						<span class="right-aligned">{$_('investments')}</span>
						<span class="right-aligned">{$_('totalDeposits')}</span>
						<span class="right-aligned">{$_('totalWithdrawals')}</span>
						<span class="right-aligned"></span>
					</li>
					{#each portfolios as portfolio}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<li
							class="portfolios portfolio"
							onclick={(e: MouseEvent) => {
								if (!e.defaultPrevented) {
									goto(routes.CLIENT_PORTFOLIO(clientId, portfolio.id))
								}
							}}
						>
							<span>{portfolio.name}</span>
							<span>{portfolio.currency}</span>
							<span>{formatDate(new Date(portfolio.last_edited_at))}</span>
							<span class="right-aligned">{numInvestments(portfolio.id)}</span>
							<span class="right-aligned">{totalPortfolioDeposits(portfolio.id)}</span>
							<span class="right-aligned">{totalPortfolioWithdrawals(portfolio.id)}</span>
							<span class="right-aligned">{@render portfolioDropdown(portfolio.id)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</main>
{/if}

<DeleteModal
	confirm={deletePortfolio}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('Delete portfolio?')}
	text={$_(
		'This portfolio and all the investments it contains will be deleted permanently. There’s no undo.',
	)}
/>

<style>
	:root {
		--max-width: 1370px;
	}
	main {
		margin: var(--double-padding);
	}
	.topbar {
		padding: var(--double-padding);
		border-top: 1px solid var(--colors-low);
		border-bottom: 1px solid var(--colors-low);
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--half-padding);
	}
	.grower {
		flex: 1;
	}
	ul {
		padding-left: 0;
	}
	li > span {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--half-padding);
		white-space: nowrap;
	}
	.portfolios {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
		align-items: center;
		gap: var(--double-padding);
		border-bottom: 1px solid var(--colors-low);
		background-color: var(--colors-ultra-low);
		padding-top: var(--half-padding);
		padding-bottom: var(--half-padding);
		width: 100%;
	}
	.title {
		border-bottom: 1px solid var(--colors-ultra-high);
		color: var(--colors-ultra-high);
		font-size: var(--font-size-h5);
		font-family: var(--font-family-sans-serif);
		font-weight: 700;
	}
	.portfolio {
		border-bottom: 1px solid var(--colors-low);
		font-size: var(--font-size);
		font-family: var(--font-family-sans-serif);
		cursor: pointer;
	}
	.right-aligned {
		display: flex;
		justify-content: flex-end;
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
</style>
