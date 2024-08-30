<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import SearchInput from '$lib/components/input/search-input.svelte'
	import Typography from '$lib/components/typography.svelte'
	import { ChevronDown, Logout, OverflowMenuVertical, UserFollow } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import { formatAge, formatDate } from '$lib/utils'
	import AddClient from '$lib/components/add-client.svelte'
	import Avatar from '$lib/components/avatar.svelte'
	import LogIn from '$lib/components/login.svelte'
	import adapter from '$lib/adapters'
	import type { ClientNoId } from '$lib/types'
	import Loader from '$lib/components/loader.svelte'
	import Registration from '$lib/components/registration.svelte'

	let dialog: HTMLDialogElement | undefined
	let registration: boolean = $state(false)

	function addClient() {
		dialog?.showModal()
	}

	function closeClientDialog() {
		dialog?.close()
	}

	async function createClient(client: ClientNoId) {
		try {
			await adapter.addClient(client)
			closeClientDialog()
		} catch (error) {
			console.error(error)
		}
	}
</script>

<main>
	{#if !adapter.authStore.isLoggedIn}
		{#if registration}
			<Registration login={() => (registration = false)} />
		{:else}
			<LogIn register={() => (registration = true)} />
		{/if}
	{:else}
		<section class="top-bar horizontal">
			<Typography variant="h4">{$_('allClients')}</Typography>
			<div class="grower"></div>
			<SearchInput variant="solid" placeholder="Search"></SearchInput>
			<Button variant="strong" onclick={addClient}><UserFollow />{$_('addClient')}</Button>
			<Button
				variant="strong"
				onclick={() => {
					adapter.signOut()
				}}
			>
				<Logout size={24} /></Button
			>
		</section>
		{#if adapter.clients}
			{#if adapter.clients.loading}
				<Typography>Loading...</Typography><Loader />
			{:else if adapter.clients.data.length === 0}
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
					{#each adapter.clients.data as client}
						{@const birtDate = new Date(client.birth_date)}
						<li class="clients client">
							<span
								><Avatar
									name={client.name}
									birthDate={birtDate}
									imageURI={undefined}
								/>{client.name}</span
							>
							<span>{formatDate(new Date(client.birth_date))}</span>
							<span class="right-aligned">{formatAge(birtDate)}</span>
							<span class="right-aligned">{0}</span>
							<span class="right-aligned">{0}</span>
							<span class="right-aligned"
								><Button variant="ghost"><OverflowMenuVertical size={24} /></Button></span
							>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
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
