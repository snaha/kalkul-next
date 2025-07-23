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
		LogoYoutube,
		Launch,
		ArrowRight,
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
	import DesktopOnly from '$lib/components/desktop-only.svelte'
	import MobileOnly from '$lib/components/mobile-only.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import { PUBLIC_DISCORD_LINK } from '$env/static/public'
	import HelpBox from '$lib/components/help-box.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import BetaBadge from '$lib/components/beta-badge.svelte'
	import VideoModal from '$lib/components/video-modal.svelte'

	const samplePortfolioLink = 'https://kalkul.app/view/e9g7fpmpobz23ja8c5zhgogx'

	let showConfirmModal = $state(false)
	let showWelcome = $derived(authStore.user?.user_metadata.first_visit ? true : false)
	let clientToBeDeleted: number | undefined = $state()
	let searchQuery = $state('')
	let filteredClient = $derived(searchByName(searchQuery))
	let isVideoPlayer = $state(false)

	async function hideWelcome() {
		await adapter.updateUserMetadata({ first_visit: false })
	}

	function hideVideoPlayer() {
		isVideoPlayer = false
	}

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
				><FolderShared size={24} />{$_('page.home.portfoliosView')}</ListItem
			>
			<ListItem onclick={() => goto(routes.EDIT_CLIENT(clientId))}
				><UserProfile size={24} />{$_('page.home.clientEdit')}</ListItem
			>
			<ListItem onclick={() => confirmDeleteClient(clientId)}
				><TrashCan size={24} />{$_('page.home.clientDeleteButton')}</ListItem
			>
		</List>
	</Dropdown>
{/snippet}

{#snippet welcomeDesktop()}
	<Vertical --vertical-gap="0" --vertical-align-items="center">
		<Vertical
			--vertical-gap="var(--double-padding)"
			style="padding-top: var(--padding)"
			class="max560"
		>
			<div class="video">
				<iframe src="https://www.youtube.com/embed/0WOElk__PU0" title="intro video"> </iframe>
			</div>
			<Vertical --vertical-gap="var(--half-padding)" --vertical-align-items="center" class="max560">
				<Typography variant="h4" class="text-center">{$_('page.home.welcomeToKalkul')}</Typography>
				<Typography class="text-center" variant="large"
					>{$_('page.home.kalkulExplanation')}</Typography
				>
			</Vertical>
			<Horizontal
				--horizontal-gap="var(--half-padding)"
				--horizontal-align-items="stretch"
				class="max560"
			>
				<Button variant="secondary" href={samplePortfolioLink} target="_blank" class="max560"
					>{$_('common.viewSamplePortfolio')}</Button
				>
				<Button variant="strong" onclick={hideWelcome} target="_blank" class="max560">
					{$_('component.welcome.startUsingKalkul')}
					<ArrowRight size={24} />
				</Button>
			</Horizontal>
			<Horizontal --horizontal-gap="var(--half-padding)" --horizontal-align-items="center">
				<BetaBadge>beta</BetaBadge>
				<Typography variant="small" --typography-color="var(--colors-high)">
					{$_('page.home.kalkulIsBeta')}
				</Typography>
			</Horizontal>
		</Vertical>
	</Vertical>
{/snippet}

{#snippet welcomeMobile()}
	<Vertical --vertical-gap="0" --vertical-align-items="center">
		<Vertical --vertical-gap="var(--padding)" style="padding-top: var(--padding)" class="max560">
			<div class="video">
				<iframe src="https://www.youtube.com/embed/0WOElk__PU0" title="intro video"> </iframe>
			</div>
			<Vertical --vertical-gap="var(--half-padding)" --vertical-align-items="center" class="max560">
				<Typography variant="h4" class="text-center">{$_('page.home.welcomeToKalkul')}</Typography>
				<Typography class="text-center" variant="large"
					>{$_('page.home.kalkulExplanation')}</Typography
				>
			</Vertical>
			<Vertical --vertical-gap="var(--half-padding)" --vertical-align-items="center" class="max560">
				<Button variant="secondary" href={samplePortfolioLink} target="_blank" class="max560"
					>{$_('common.viewSamplePortfolio')}</Button
				>
				<Button variant="secondary" href={PUBLIC_DISCORD_LINK} target="_blank" class="max560"
					>{$_('page.home.joinCommunity')}</Button
				>
			</Vertical>
			<Vertical --vertical-gap="var(--half-padding)" --vertical-align-items="center" class="max560">
				<Typography variant="h5" class="text-center">{$_('page.home.whatsNext')}</Typography>
				<Vertical --vertical-gap="var(--half-padding)">
					<Typography class="text-center">{$_('page.home.loginOnComputer')}</Typography>
					<Typography variant="small" class="text-center"
						>{$_('page.home.kalkulNotAvailableOnMobile')}</Typography
					>
				</Vertical>
			</Vertical>
		</Vertical>
	</Vertical>
{/snippet}

<Header />
<DesktopOnly>
	<main>
		{#if showWelcome}
			{@render welcomeDesktop()}
		{:else if clientStore.loading}
			<Typography>Loading...</Typography><Loader />
		{:else if clientStore.data.length === 0}
			<section class="empty">
				<img src={`${base}/images/no-client.svg`} alt="No client yet" />
				<Typography variant="h4">{$_('page.home.noClientsYet')}</Typography>
				<Typography>{$_('page.home.createYourFirstClient')}</Typography>
				<div class="spacer"></div>
				<Button variant="strong" onclick={addClient}
					><UserFollow />{$_('page.home.addClient')}</Button
				>
			</section>
			<HelpBox
				open={true}
				title={$_('helpBox.addClientTitle')}
				boxText={$_('helpBox.addClientText')}
				text={$_('helpBox.clientListExplanation')}
			>
				<Vertical --vertical-gap="var(--half-padding)">
					<Button
						variant="solid"
						dimension="compact"
						onclick={() => {
							isVideoPlayer = true
						}}><LogoYoutube size={24} />{$_('helpBox.watchIntroVideo')}</Button
					>
					<Button variant="solid" dimension="compact" href={samplePortfolioLink} target="_blank"
						><Launch size={24} />{$_('helpBox.viewSamplePortfolio')}</Button
					>
				</Vertical>
			</HelpBox>
		{:else}
			<section class="top-bar horizontal">
				<div class="left">
					<Typography variant="h4">{$_('page.home.allClients')}</Typography>
					<SearchInput
						bind:value={searchQuery}
						dimension="compact"
						variant="solid"
						placeholder="Search"
					></SearchInput>
					{#if searchQuery.length > 0}
						<Button dimension="compact" variant="ghost" onclick={() => (searchQuery = '')}
							>{$_('page.home.clearSearch')}</Button
						>
					{/if}
				</div>
				<div class="grower"></div>
				<Button dimension="compact" variant="strong" onclick={addClient}
					><UserFollow />{$_('page.home.addClient')}</Button
				>
			</section>

			<ul>
				<li class="clients title">
					<span>{$_('common.name')}</span>
					<span>{$_('common.birthDate')}</span>
					<span class="right-aligned">{$_('common.age')}</span>
					<span class="right-aligned">{$_('common.portfolios')}</span>
					<span class="right-aligned">{$_('common.investments')}</span>
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

	<VideoModal oncancel={hideVideoPlayer} bind:open={isVideoPlayer} />
</DesktopOnly>
<MobileOnly>
	{@render welcomeMobile()}
</MobileOnly>

<DeleteModal
	confirm={deleteClient}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('page.home.clientDelete')}
	text={$_('page.home.clientDeleteWarning')}
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
	.video {
		background-color: black;
		width: 100%;
		max-width: 100%;
		aspect-ratio: 16 / 9;
	}
	:global(.text-center) {
		text-align: center;
	}
	iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}
	:global(.max560) {
		max-width: 560px;
		width: 100%;
	}
	:global(.bg-ultra-low) {
		background-color: var(--colors-ultra-low);
	}
</style>
