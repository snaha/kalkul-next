<script lang="ts">
	import { ArrowRight, UserAvatar } from 'carbon-icons-svelte'
	import BetaBadge from './beta-badge.svelte'
	import Logo from './icons/logo.svelte'
	import Button from './ui/button.svelte'
	import { _, locale } from 'svelte-i18n'
	import routes from '$lib/routes'
	import Typography from './ui/typography.svelte'
	import Vertical from './ui/vertical.svelte'
	import Footer from './footer.svelte'
	import YoutubeIntroVideo from './youtube-intro-video.svelte'

	type Props = {
		isMobile: boolean
	}

	const { isMobile }: Props = $props()
</script>

<header class:mobile={isMobile}>
	<div class="left">
		<Logo size={48} />
		<BetaBadge>beta</BetaBadge>
	</div>
	<div class="right">
		<Button variant="ghost" onclick={() => ($locale = $locale?.startsWith('en') ? 'cs' : 'en')}>
			{#if $locale?.startsWith('en')}
				CZ
			{:else}
				EN
			{/if}
		</Button>
		<Button variant="secondary" href={routes.LOGIN}
			><UserAvatar size={24} />{$_('common.login')}</Button
		>
		<Button variant="strong" href={routes.SIGNUP}>{$_('common.signup')}</Button>
	</div>
</header>
<main class:mobile={isMobile}>
	<Vertical
		class="max-width560"
		--vertical-gap="var(--double-padding)"
		--vertical-justify-content="center"
		--vertical-align-items="center"
	>
		<YoutubeIntroVideo />
		{#if isMobile}
			<Typography variant="h2">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html $_('page.landing.title', {
					values: { colorHigh: `<span class='color-high'>${$_('page.landing.titleHigh')}</span>` },
				})}</Typography
			>
		{:else}
			<span class="headline">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html $_('page.landing.title', {
					values: { colorHigh: `<span class='color-high'>${$_('page.landing.titleHigh')}</span>` },
				})}
			</span>
		{/if}
		<Typography variant="large">{$_('page.landing.subtitle')}</Typography>

		<Vertical --vertical-gap="var(--double-padding)">
			<Button variant="strong" dimension="large" href={routes.SIGNUP}
				>{$_('page.landing.getStarted')}<ArrowRight size={24} /></Button
			>
			<Vertical --vertical-gap="var(--half-padding)">
				<BetaBadge>beta</BetaBadge>
				<Typography class="color-high">
					{$_('page.landing.betaAccessTitle')}
					<br />
					{$_('page.landing.betaAccessDescription')}
				</Typography>
				<Typography class="color-high" variant="small">
					{$_('page.landing.betaDiscountText')}
				</Typography>
			</Vertical>
		</Vertical>
	</Vertical>
</main>
<Footer />

<style>
	:global(.color-high) {
		color: var(--colors-high) !important;
	}
	:global(.color-red) {
		color: var(--colors-red) !important;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--double-padding);
	}
	.left {
		display: flex;
		align-items: center;
	}
	.right {
		display: flex;
		gap: var(--half-padding);
	}
	main {
		display: flex;
		width: 100%;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--double-padding);
	}
	:global(.max-width560) {
		max-width: 560px;
		text-align: center;
	}
	:global(.flex) {
		flex: 1;
	}
	.headline {
		font-family: var(--font-family-sans-serif);
		font-size: 56px;
		font-weight: bold;
		line-height: 64px;
		font-variant-numeric: lining-nums;
		font-variant-numeric: tabular-nums;
	}
	.mobile {
		padding: var(--padding);
	}
</style>
