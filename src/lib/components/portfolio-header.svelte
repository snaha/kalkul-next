<script lang="ts">
	import { portfolioStore } from '$lib/stores/portfolio.svelte'

	import DeleteModal from './delete-modal.svelte'
	import { goto } from '$app/navigation'
	import { cascadeDeletePortfolio, cascadeDuplicatePortfolio } from '$lib/cascade'
	import routes from '$lib/routes'
	import {
		Add,
		Share,
		OverflowMenuVertical,
		FolderDetails,
		Copy,
		TrashCan,
	} from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Avatar from './avatar.svelte'
	import Button from './ui/button.svelte'
	import Dropdown from './ui/dropdown.svelte'
	import List from './ui/list/list.svelte'
	import ListItem from './ui/list/list-item.svelte'
	import Typography from './ui/typography.svelte'
	import type { Client, Portfolio } from '$lib/types'

	type Props = {
		client: Client
		portfolio: Portfolio
	}

	let { client, portfolio }: Props = $props()

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
		await cascadeDeletePortfolio(portfolio.id)
		showConfirmModal = false
		goto(routes.CLIENT(client.id))
	}
</script>

<section class="topbar horizontal">
	<a href={routes.CLIENT(client.id)}>
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
	:global(.grower) {
		flex: 1;
	}
</style>
