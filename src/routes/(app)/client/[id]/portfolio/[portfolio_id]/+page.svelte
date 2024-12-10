<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import {
		Add,
		Copy,
		FolderDetails,
		OverflowMenuVertical,
		Share,
		TrashCan,
	} from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Avatar from '$lib/components/avatar.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import routes from '$lib/routes'
	import { page } from '$app/stores'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { goto } from '$app/navigation'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import InvestmentCard from '$lib/components/investment-card.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import List from '$lib/components/ui/list/list.svelte'
	import ListItem from '$lib/components/ui/list/list-item.svelte'
	import { cascadeDeletePortfolio, cascadeDuplicatePortfolio } from '$lib/cascade'
	import DeleteModal from '$lib/components/delete-modal.svelte'

	const clientId = parseInt($page.params.id, 10)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = parseInt($page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	const investments = $derived(investmentStore.filter(portfolioId))
	let showConfirmModal = $state(false)

	function addInvestment() {
		goto(routes.NEW_INVESTMENT(clientId, portfolioId))
	}

	function share() {
		goto(routes.SHARE(portfolioId))
	}

	function confirmDeletePortfolio() {
		showConfirmModal = true
	}

	async function deletePortfolio() {
		await cascadeDeletePortfolio(portfolioId)
		showConfirmModal = false
		goto(routes.CLIENT(clientId))
	}
</script>

{#if portfolioStore.loading}
	<Loader />
{:else if !portfolio || !client}
	404 Not found ???
{:else}
	<main>
		<section class="topbar horizontal">
			<a href={routes.CLIENT(clientId)}>
				<Avatar name={client.name} birthDate={new Date(client.birth_date)} />
			</a>
			<Typography variant="h4" bold>{portfolio.name}</Typography>
			<Typography variant="large">| {client.name}</Typography>
			<div class="grower"></div>
			<Button dimension="compact" variant="strong" onclick={addInvestment}
				><Add size={24} />{$_('Add investment')}</Button
			>
			<Button dimension="compact" variant="secondary" onclick={share}
				><Share size={24} />{$_('share')}</Button
			>
			<Dropdown left buttonDimension="compact">
				{#snippet button()}
					<OverflowMenuVertical size={24} />
				{/snippet}
				<List>
					<ListItem onclick={() => goto(routes.CLIENT_EDIT_PORTFOLIO(clientId, portfolioId))}
						><FolderDetails size={24} />{$_('Edit portfolio details')}</ListItem
					>
					<ListItem onclick={() => goto(routes.CLIENT_NEW_PORTFOLIO(clientId))}
						><Add size={24} />{$_('Add portfolio')}</ListItem
					>
					<ListItem
						onclick={async () => {
							const duplicatedPortfolioId = await cascadeDuplicatePortfolio(clientId, portfolioId)
							if (!duplicatedPortfolioId) {
								return
							}
							goto(routes.CLIENT_PORTFOLIO(clientId, duplicatedPortfolioId))
						}}><Copy size={24} />{$_('Duplicate portfolio')}</ListItem
					>
					<ListItem onclick={() => confirmDeletePortfolio()}
						><TrashCan size={24} />{$_('Delete portfolio')}</ListItem
					>
				</List>
			</Dropdown>
		</section>
		<section class="horizontal grower">
			<section class="sidebar vertical">
				<section class="investments">
					{#each investments as investment}
						<InvestmentCard {investment} {portfolio} />
					{/each}
				</section>
				<Button dimension="small" variant="strong" onclick={addInvestment}>
					<Add size={16} />{$_('addInvestment')}</Button
				>
			</section>
			<section class="graph"></section>
		</section>
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
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.topbar {
		padding: var(--padding);
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
	.horizontal a {
		display: flex;
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--padding);
	}
	:global(.grower) {
		flex: 1;
	}
	.sidebar {
		width: 320px;
		border-right: 1px solid var(--colors-low);
		height: 100%;
		padding: var(--padding);
	}
	.investments {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
</style>
