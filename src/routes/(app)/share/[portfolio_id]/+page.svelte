<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import adapters from '$lib/adapters'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import CopyButton from '$lib/components/copy-button.svelte'
	import LinkSharingModal from '$lib/components/link-sharing-modal.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Toggle from '$lib/components/ui/toggle.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import { generateRandomString } from '$lib/random'
	import routes from '$lib/routes'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { Checkmark, Close } from 'carbon-icons-svelte'
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'

	const portfolioId = parseInt(page.params.portfolio_id, 10)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))
	let linkSharing = $state(false)
	let linkValue = $derived(
		portfolio?.link ? `${page.url.origin}${routes.VIEW(portfolio.link)}` : undefined,
	)
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
</script>

<ContentLayout>
	<Vertical
		--vertical-align-items="stretch"
		--vertical-gap="var(--double-padding)"
		class="max560 stretch"
	>
		<Typography variant="h3">{$_('page.share.sharePortfolio')}</Typography>

		<Vertical --vertical-gap="var(--padding)">
			<Toggle
				label={$_('page.share.linkSharingToggle')}
				checked={linkSharing}
				onclick={(e) => handleToggleClick(e)}
			></Toggle>
			{#if linkValue}
				<section class="horizontal">
					<Input
						value={linkValue}
						inert
						class="stretch max560"
						label={$_('common.portfolioLink')}
					/>
					<CopyButton
						variant="ghost"
						position="bottom"
						helperText={$_('page.share.linkCopied')}
						copyText={linkValue}
					/>
				</section>
			{:else}
				<Vertical --vertical-gap="var(--half-padding)">
					<Typography>{$_('page.share.activateLinkText')}</Typography>
					<Typography variant="small">{$_('page.share.deactivateLinkText')}</Typography>
				</Vertical>
			{/if}
		</Vertical>
		<Horizontal>
			{#if portfolio?.link}
				<Button variant="secondary" dimension="compact" onclick={cancel}
					><Checkmark size={24} />{$_('common.done')}</Button
				>
			{:else}
				<Button variant="secondary" dimension="compact" onclick={cancel}
					><Close size={24} />{$_('page.share.dontShare')}</Button
				>
			{/if}
		</Horizontal>
	</Vertical>
</ContentLayout>
<LinkSharingModal bind:open={showSharingOffModal} confirm={confirmModal} oncancel={cancelModal} />

<style lang="postcss">
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
