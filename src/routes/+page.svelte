<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import SearchInput from '$lib/components/input/search-input.svelte'
	import Typography from '$lib/components/typography.svelte'
	import { ChevronDown, OverflowMenuVertical, UserFollow } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import { clientStore, type Client } from '$lib/stores/clients.svelte'
	import { formatAge, formatDate } from '$lib/utils'
	import AddClient from '$lib/components/add-client.svelte'
	import Avatar from '$lib/components/avatar.svelte'

	let dialog: HTMLDialogElement | undefined

	function addClient() {
		dialog?.showModal()
	}

	function closeClientDialog() {
		dialog?.close()
	}

	function createClient(name: string, birthDate: Date, imageURI?: string) {
		const client: Client = {
			name,
			birthDate,
			imageURI,
			portfolios: [],
			investments: [],
		}

		clientStore.addClient(client)

		closeClientDialog()
	}
</script>

<main>
	<section class="top-bar horizontal">
		<Typography variant="h4">{$_('allClients')}</Typography>
		<div class="grower"></div>
		<SearchInput variant="solid" placeholder="Search"></SearchInput>
		<Button variant="strong" onclick={addClient}><UserFollow />{$_('addClient')}</Button>
	</section>

	{#if clientStore.clients.length === 0}
		<section class="empty">
			<Typography variant="h4">{$_('noClientsYet')}</Typography>
			<Typography>{$_('createYourFirstClient')}</Typography>
			<div class="spacer"></div>
			<Button variant="strong" onclick={addClient}><UserFollow />{$_('addClient')}</Button>
		</section>
	{:else}
		<ul>
			<li class="clients title">
				<span>{$_('name')}<ChevronDown size={24} /></span>
				<span>{$_('birthDate')}</span>
				<span class="right-aligned">{$_('age')}</span>
				<span class="right-aligned">{$_('portfolios')}</span>
				<span class="right-aligned">{$_('investments')}</span>
				<span class="right-aligned"></span>
			</li>
			{#each clientStore.clients as client}
				<li class="clients client">
					<span
						><Avatar
							name={client.name}
							birthDate={client.birthDate}
							imageURI={client.imageURI}
						/>{client.name}</span
					>
					<span>{formatDate(client.birthDate)}</span>
					<span class="right-aligned">{formatAge(client.birthDate)}</span>
					<span class="right-aligned">{client.portfolios.length}</span>
					<span class="right-aligned">{client.investments.length}</span>
					<span class="right-aligned"
						><Button variant="ghost"><OverflowMenuVertical size={24} /></Button></span
					>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<dialog bind:this={dialog}>
	<AddClient close={closeClientDialog} {createClient} />
</dialog>

<style>
	:root {
		--max-width: 1370px;
	}
	main {
		margin: var(--padding);
	}
	dialog {
		width: 560px;
		min-height: 50%;
		background-color: var(--colors-ultra-low);
		border: 0;
		border-radius: var(--border-radius);
		padding: var(--double-padding);
	}
	dialog::backdrop {
		background-color: var(--colors-dark-overlay);
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
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
	}
	.clients {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr 1fr 1fr 1fr;
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
	.client {
		border-bottom: 1px solid var(--colors-low);
		font-size: var(--font-size);
		font-family: var(--font-family-sans-serif);
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
