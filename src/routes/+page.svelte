<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import SearchInput from '$lib/components/ui/input/search-input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { ChevronDown, Logout, OverflowMenuVertical, UserFollow } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import { formatAge, formatDate } from '$lib/utils'
	import Avatar from '$lib/components/avatar.svelte'
	import adapter from '$lib/adapters'
	import Loader from '$lib/components/ui/loader.svelte'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'

	function addClient() {
		goto(routes.NEW_CLIENT)
	}
</script>

<main>
	<section class="top-bar horizontal">
		<Typography variant="h4">{$_('allClients')}</Typography>
		<div class="grower"></div>
		<SearchInput dimension="compact" variant="solid" placeholder="Search"></SearchInput>
		<Button dimension="compact" variant="strong" onclick={addClient}
			><UserFollow />{$_('addClient')}</Button
		>
		<Button
			dimension="compact"
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
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li class="clients client" onclick={() => goto(routes.CLIENT(client.id))}>
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
						<span class="right-aligned"
							><Button dimension="compact" variant="ghost"
								><OverflowMenuVertical size={24} /></Button
							></span
						>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</main>

<style>
	:root {
		--max-width: 1370px;
	}
	main {
		margin: var(--padding);
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
