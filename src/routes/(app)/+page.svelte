<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import SearchInput from '$lib/components/ui/input/search-input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import {
		OverflowMenuVertical,
		UserFollow,
		FolderShared,
		UserProfile,
		TrashCan,
	} from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import { formatAge, formatDate } from '$lib/utils'
	import Avatar from '$lib/components/avatar.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import Header from '$lib/components/header.svelte'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import List from '$lib/components/ui/list/list.svelte'
	import ListItem from '$lib/components/ui/list/list-item.svelte'
	import adapter from '$lib/adapters'
	import DeleteModal from '$lib/components/delete-modal.svelte'
	import { base } from '$app/paths'

	let showConfirmModal = $state(false)
	let clientToBeDeleted: number | undefined = $state()
	let searchQuery = $state('')
	let filteredClient = $derived(searchByName(searchQuery))

	function addClient() {
		goto(routes.NEW_CLIENT)
	}

	function confirmDeleteClient(clientId: number) {
		showConfirmModal = true
		clientToBeDeleted = clientId
	}

	async function deleteClient() {
		if (clientToBeDeleted) {
			await adapter.deleteClient({ id: clientToBeDeleted })
			clientToBeDeleted = undefined
			showConfirmModal = false
		}
	}
	function searchByName(searchQuery: string) {
		if (searchQuery) {
			return clientStore.data.filter((client) =>
				client.name.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		} else {
			return clientStore.data
		}
	}
</script>

{#snippet clientDropdown(clientId: number)}
	<Dropdown left buttonDimension="compact">
		{#snippet button()}
			<OverflowMenuVertical size={24} />
		{/snippet}
		<List>
			<ListItem onclick={() => goto(routes.CLIENT(clientId))}
				><FolderShared size={24} />{$_('View portfolios')}</ListItem
			>
			<ListItem onclick={() => goto(routes.EDIT_CLIENT(clientId))}
				><UserProfile size={24} />{$_('Edit client details')}</ListItem
			>
			<ListItem onclick={() => confirmDeleteClient(clientId)}
				><TrashCan size={24} />{$_('Delete client')}</ListItem
			>
		</List>
	</Dropdown>
{/snippet}

<Header />
<main>
	<section class="top-bar horizontal">
		<div class="left">
			<Typography variant="h4">{$_('allClients')}</Typography>
			<SearchInput bind:value={searchQuery} dimension="compact" variant="solid" placeholder="Search"
			></SearchInput>
			{#if searchQuery.length > 0}
				<Button dimension="compact" variant="ghost" onclick={() => (searchQuery = '')}
					>{$_('clearSearch')}</Button
				>
			{/if}
		</div>
		<div class="grower"></div>
		<Button dimension="compact" variant="strong" onclick={addClient}
			><UserFollow />{$_('addClient')}</Button
		>
	</section>
	{#if clientStore.loading}
		<Typography>Loading...</Typography><Loader />
	{:else if clientStore.data.length === 0}
		<section class="empty">
			<img src={`${base}/images/no-client.svg`} alt="No client yet" />
			<Typography variant="h4">{$_('noClientsYet')}</Typography>
			<Typography>{$_('createYourFirstClient')}</Typography>
			<div class="spacer"></div>
			<Button variant="strong" onclick={addClient}><UserFollow />{$_('addClient')}</Button>
		</section>
	{:else}
		<ul>
			<li class="clients title">
				<span>{$_('name')}</span>
				<span>{$_('birthDate')}</span>
				<span class="right-aligned">{$_('age')}</span>
				<span class="right-aligned">{$_('portfolios')}</span>
				<span class="right-aligned">{$_('investments')}</span>
				<span class="right-aligned"></span>
			</li>
			{#each filteredClient as client}
				{@const birtDate = new Date(client.birth_date)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					class="clients client"
					onclick={(e: MouseEvent) => {
						if (!e.defaultPrevented) {
							goto(routes.CLIENT(client.id))
						}
					}}
				>
					<span
						><Avatar
							name={client.name}
							birthDate={birtDate}
							imageURI={undefined}
						/>{client.name}</span
					>
					<span>{formatDate(new Date(client.birth_date))}</span>
					<span class="right-aligned">{formatAge(birtDate)}</span>
					<span class="right-aligned">{portfolioStore.filter(client.id).length}</span>
					<span class="right-aligned">{0}</span>
					<span class="right-aligned">{@render clientDropdown(client.id)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<DeleteModal
	confirm={deleteClient}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('Delete client?')}
	text={$_(
		'This client and all the portfolios it contains will be deleted permanently. There’s no undo.',
	)}
/>

<style>
	:root {
		--max-width: 1370px;
	}
	main {
		margin: var(--double-padding);
	}
	.top-bar {
		padding-bottom: var(--padding);
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--half-padding);
	}
	.left {
		display: flex;
		align-items: center;
		gap: var(--padding);
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
	.clients {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr 1fr 1fr 1fr;
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
	.client {
		border-bottom: 1px solid var(--colors-low);
		font-size: var(--font-size);
		font-family: var(--font-family-sans-serif);
		cursor: pointer;
	}
	.client:hover {
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
