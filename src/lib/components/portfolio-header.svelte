<script lang="ts">
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import DeleteModal from './delete-modal.svelte'
	import { goto } from '$app/navigation'
	import { cascadeDuplicatePortfolio } from '$lib/cascade'
	import routes from '$lib/routes'
	import {
		Add,
		Share,
		OverflowMenuVertical,
		FolderDetails,
		Copy,
		TrashCan,
		ArrowLeft,
	} from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from './ui/button.svelte'
	import Dropdown from './ui/dropdown.svelte'
	import List from './ui/list/list.svelte'
	import ListItem from './ui/list/list-item.svelte'
	import type { Client, Investment, Portfolio } from '$lib/types'
	import adapters from '$lib/adapters'
	import PortfolioHeaderView from './portfolio-header-view.svelte'

	type Props = {
		client: Client
		portfolio: Portfolio
		investments: Investment[]
		back?: () => void
		adjustWithInflation: boolean
	}

	let { client, portfolio, investments, back, adjustWithInflation = $bindable() }: Props = $props()

	let showConfirmModal = $state(false)

	function addInvestment() {
		goto(routes.NEW_INVESTMENT(client.id, portfolio.id))
	}

	function share() {
		goto(routes.SHARE(portfolio.id))
	}

	function confirmDeletePortfolio() {
		showConfirmModal = true
	}

	async function deletePortfolio() {
		await adapters.deletePortfolio({ id: portfolio.id })
		showConfirmModal = false
		goto(routes.CLIENT(client.id))
	}
</script>

<section class="topbar horizontal">
	<div class="controls">
		<Button
			dimension="compact"
			variant="ghost"
			onclick={() => {
				if (back) back()
				else history.back()
			}}
		>
			<ArrowLeft size={24} /></Button
		>
	</div>
	<PortfolioHeaderView {client} {portfolio} {investments} bind:adjustWithInflation />
	<div class="grower"></div>
	<div class="controls">
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
				<ListItem onclick={() => goto(routes.CLIENT_EDIT_PORTFOLIO(client.id, portfolio.id))}
					><FolderDetails size={24} />{$_('Edit portfolio details')}</ListItem
				>
				<ListItem onclick={() => goto(routes.CLIENT_NEW_PORTFOLIO(client.id))}
					><Add size={24} />{$_('Add portfolio')}</ListItem
				>
				<ListItem
					onclick={async () => {
						portfolioStore.loading = true
						const duplicatedPortfolioId = await cascadeDuplicatePortfolio(client.id, portfolio.id)
						if (!duplicatedPortfolioId) {
							return
						}
						goto(routes.CLIENT_PORTFOLIO(client.id, duplicatedPortfolioId))
					}}><Copy size={24} />{$_('Duplicate portfolio')}</ListItem
				>
				<ListItem onclick={() => confirmDeletePortfolio()}
					><TrashCan size={24} />{$_('Delete portfolio')}</ListItem
				>
			</List>
		</Dropdown>
	</div>
</section>

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
	:global(.grower) {
		flex: 1;
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
	.controls {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--half-padding);
	}
</style>
