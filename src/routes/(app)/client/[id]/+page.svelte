<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import {
		Add,
		ArrowLeft,
		Copy,
		Folder,
		FolderDetails,
		Launch,
		OverflowMenuVertical,
		Share,
		TrashCan,
		UserFollow,
		UserProfile,
	} from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import { formatCurrency, formatDate } from '$lib/utils'
	import Avatar from '$lib/components/avatar.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import List from '$lib/components/ui/list/list.svelte'
	import ListItem from '$lib/components/ui/list/list-item.svelte'
	import DeleteModal from '$lib/components/delete-modal.svelte'
	import { cascadeDuplicatePortfolio } from '$lib/cascade'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import adapters from '$lib/adapters'
	import { base } from '$app/paths'
	import { calculateNumOccurrences } from '$lib/@snaha/kalkul-maths'
	import HelpBox from '$lib/components/help-box.svelte'

	const clientId = parseInt(page.params.id, 10)
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

		await adapters.deletePortfolio({ id: portfolioToBeDeleted })
		portfolioToBeDeleted = undefined
		showConfirmModal = false
	}

	function portfolioValue(portfolioId: number): number {
		return investmentStore.filter(portfolioId).reduce((total, investment) => {
			const transactions = transactionStore.filter(investment.id)

			let deposits = 0
			let withdrawals = 0

			for (const transaction of transactions) {
				const amount = transaction.end_date
					? transaction.amount * calculateNumOccurrences(transaction)
					: transaction.amount

				if (transaction.type === 'deposit') {
					deposits += amount
				} else if (transaction.type === 'withdrawal') {
					withdrawals += amount
				}
			}

			return total + (deposits - withdrawals)
		}, 0)
	}
</script>

{#snippet portfolioDropdown(portfolioId: number)}
	<Dropdown left buttonDimension="compact">
		{#snippet button()}
			<OverflowMenuVertical size={24} />
		{/snippet}
		<List>
			<ListItem onclick={() => goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))}
				><Folder size={24} />{$_('page.portfolio.openPortfolio')}</ListItem
			>
			<ListItem onclick={() => goto(routes.SHARE(portfolioId))}
				><Share size={24} />{$_('page.portfolio.sharePortfolio')}</ListItem
			>
			<ListItem onclick={() => goto(routes.CLIENT_EDIT_PORTFOLIO(clientId, portfolioId))}
				><FolderDetails size={24} />{$_('page.portfolio.editPortfolioDetails')}</ListItem
			>
			<ListItem onclick={() => cascadeDuplicatePortfolio(clientId, portfolioId)}
				><Copy size={24} />{$_('page.portfolio.duplicatePortfolio')}</ListItem
			>
			<ListItem onclick={() => confirmDeletePortfolio(portfolioId)}
				><TrashCan size={24} />{$_('page.portfolio.deletePortfolio')}</ListItem
			>
		</List>
	</Dropdown>
{/snippet}

{#snippet viewButton(link: string | null, portfolioId: number)}
	{#if link}
		<Button
			variant="ghost"
			dimension="compact"
			href={routes.VIEW(link)}
			onclick={(e: Event) => e.stopPropagation()}
			target="_blank"><Launch size={24} /></Button
		>
	{:else}
		<Button
			variant="ghost"
			dimension="compact"
			onclick={(e: Event) => {
				e.preventDefault()
				goto(routes.SHARE(portfolioId))
			}}><Share size={24} /></Button
		>
	{/if}
{/snippet}

{#if !client}
	<Loader />
{:else}
	<section class="topbar horizontal">
		<Button
			dimension="default"
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
		<Button dimension="default" variant="strong" onclick={addPortfolio}
			><Add size={24} />{$_('page.portfolio.addPortfolio')}</Button
		>
		<Button
			dimension="default"
			variant="secondary"
			onclick={() => goto(routes.EDIT_CLIENT(clientId))}
			><UserProfile size={24} />{$_('page.portfolio.editClient')}</Button
		>
	</section>
	<main>
		{#if client}
			{#if portfolioStore.loading}
				<Typography>{$_('common.loading')}</Typography><Loader />
			{:else if portfolios.length === 0}
				<section class="empty">
					<img src={`${base}/images/no-portfolio.svg`} alt="No portfolio yet" />
					<div class="spacer"></div>
					<Typography variant="h4">{$_('page.client.noPortfoliosYet')}</Typography>
					<Typography>{$_('page.client.createYourFirstPortfolio')}</Typography>
					<div class="spacer"></div>
					<Button variant="strong" onclick={addPortfolio}
						><UserFollow />{$_('page.portfolio.addPortfolio')}</Button
					>
				</section>
			{:else}
				<ul>
					<li class="portfolios title">
						<span>{$_('common.portfolioName')}</span>
						<span>{$_('common.currency')}</span>
						<span>{$_('common.startDate')}</span>
						<span>{$_('common.endDate')}</span>
						<span class="right-aligned">{$_('common.inflation')}</span>
						<span class="right-aligned">{$_('common.currentValue')}</span>
						<span></span>
						<span></span>
					</li>
					{#each portfolios as portfolio}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<li
							class="portfolios portfolio table-row"
							onclick={(e: MouseEvent) => {
								if (!e.defaultPrevented) {
									goto(routes.CLIENT_PORTFOLIO(clientId, portfolio.id))
								}
							}}
						>
							<span>{portfolio.name}</span>
							<span>{portfolio.currency}</span>
							<span>{formatDate(new Date(portfolio.start_date))}</span>
							<span>{formatDate(new Date(portfolio.end_date))}</span>
							<span class="right-aligned">{portfolio.inflation_rate * 100}%</span>
							<span class="right-aligned"
								>{formatCurrency(portfolioValue(portfolio.id), portfolio.currency)}</span
							>
							<span class="right-aligned">{@render viewButton(portfolio.link, portfolio.id)}</span>
							<span class="right-aligned">{@render portfolioDropdown(portfolio.id)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</main>
{/if}

{#if portfolioStore.data.length === 0}
	<HelpBox
		open={portfolioStore.data.length === 0}
		title={$_('Add portfolio')}
		boxText={$_('Press the “Add portfolio” button to add a first portfolio for this client')}
		text={$_(
			'A portfolio will contain specific investments. Use portfolios to organise investments for your client. You can create as many portfolios as you want for each client. All the portfolios for this client will be listed on the client’s page.',
		)}
	></HelpBox>
{/if}

<DeleteModal
	confirm={deletePortfolio}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('page.client.deletePortfolio')}
	text={$_('page.client.deletePortfolioWarning')}
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
		overflow-wrap: anywhere;
	}
	.portfolios {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 42px 42px;
		align-items: center;
		gap: var(--half-padding);
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
	.portfolio:hover {
		background-color: color-mix(in srgb, var(--colors-low) 25%, transparent);
	}
	.right-aligned {
		display: flex;
		justify-content: flex-end;
		text-align: right;
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
