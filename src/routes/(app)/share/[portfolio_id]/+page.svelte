<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import adapters from '$lib/adapters'
	import CopyButton from '$lib/components/copy-button.svelte'
	import LinkSharingModal from '$lib/components/link-sharing-modal.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Toggle from '$lib/components/ui/toggle.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { generateRandomString } from '$lib/random'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { Checkmark, Close } from 'carbon-icons-svelte'
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'

	const portfolioId = parseInt($page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	let linkSharing = $state(false)
	let linkValue = $derived(portfolio?.link ? createLink(portfolio?.link) : undefined)
	let showSharingOffModal = $state(false)

	onMount(() => {
		linkSharing = portfolio?.link ? true : false
	})

	function cancel() {
		history.back()
	}

	function handleToggleClick(event: Event) {
		event.preventDefault()
		if (linkSharing) {
			showSharingOffModal = true
		} else {
			switchLinkSharing(true)
		}
	}

	async function confirmModal() {
		await switchLinkSharing(false)
		showSharingOffModal = false
	}

	function cancelModal() {
		showSharingOffModal = false
	}

	async function switchLinkSharing(enable: boolean) {
		if (!browser || !portfolio) return
		if (enable) {
			const randomLength = 16
			const randomBase = 36
			const getRandomValues = () =>
				new Uint8Array(new Array(randomLength).fill(0).map(() => Math.floor(Math.random() * 256)))
			const random = generateRandomString(randomLength, randomBase, getRandomValues)
			await adapters.updatePortfolio({ id: portfolio.id, link: random })
		} else {
			await adapters.updatePortfolio({ id: portfolio.id, link: null })
		}
		linkSharing = enable
	}

	function createLink(random: string) {
		return `${$page.url.origin}/view/${random}`
	}
</script>

<main>
	<form>
		<Typography variant="h3">{$_('Share portfolio')}</Typography>
		<div class="spacer"></div>
		<div class="spacer"></div>
		<div class="spacer"></div>
		<div class="spacer"></div>
		<Toggle
			label={$_('Link sharing (view only)')}
			checked={linkSharing}
			onclick={(e) => handleToggleClick(e)}
		></Toggle>
		<div class="spacer"></div>
		<div class="spacer"></div>
		{#if linkValue}
			<section class="horizontal">
				<Input value={linkValue} inert class="stretch max560" label={$_('Portfolio link')} />
				<CopyButton
					variant="ghost"
					position="bottom"
					helperText={$_('Link copied')}
					copyText={linkValue}
				/>
			</section>
		{:else}
			<Typography
				>{$_(
					'Activate link sharing to easily share this portfolio page with your client.',
				)}</Typography
			>
			<div class="spacer"></div>
			<Typography variant="small"
				>{$_(
					'The client will not be able to edit or make any changes to the portfolio data.',
				)}</Typography
			>
		{/if}
		<div class="spacer"></div>
		<div class="spacer"></div>
		<div class="spacer"></div>
		<div class="spacer"></div>
		{#if portfolio?.link}
			<Button variant="secondary" dimension="compact" onclick={cancel}
				><Checkmark size={24} />{$_('Done')}</Button
			>
		{:else}
			<Button variant="secondary" dimension="compact" onclick={cancel}
				><Close size={24} />{$_(`Don't share`)}</Button
			>
		{/if}
	</form>
</main>
<LinkSharingModal bind:open={showSharingOffModal} confirm={confirmModal} oncancel={cancelModal} />

<style lang="postcss">
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
	form {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		max-width: 560px;
		width: 100%;
	}
	.spacer {
		margin-top: var(--half-padding);
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-end;
		gap: var(--padding);
		width: 100%;
	}
	:global(.stretch) {
		width: 100%;
	}
	:global(.max560) {
		max-width: 560px;
	}
</style>
