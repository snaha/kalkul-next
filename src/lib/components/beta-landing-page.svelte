<script lang="ts">
	import { ArrowRight, UserAvatar, WarningFilled } from 'carbon-icons-svelte'
	import BetaBadge from './beta-badge.svelte'
	import Logo from './icons/logo.svelte'
	import Button from './ui/button.svelte'
	import { _, locale } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { base } from '$app/paths'
	import Typography from './ui/typography.svelte'
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
	{#if !isMobile}
		<div class="right">
			<Button variant="ghost" onclick={() => ($locale = $locale === 'en' ? 'cs' : 'en')}>
				{#if $locale === 'en'}
					CZ
				{:else}
					EN
				{/if}
			</Button>
			<Button variant="secondary" href={routes.LOGIN}><UserAvatar size={24} />{$_('login')}</Button>
			<Button variant="strong" href={routes.SIGNUP}
				>{$_('landingPage.getStarted')}<ArrowRight size={24} /></Button
			>
		</div>
	{/if}
</header>
<main class:mobile={isMobile}>
	<div class="container">
		<section class="max-width560">
			<img src={`${base}/images/beta-landing-page.svg`} alt="Intro img" />
			{#if isMobile}
				<Typography variant="h2">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('landingPage.title', {
						values: { colorHigh: `<span class='color-high'>${$_('landingPage.titleHigh')}</span>` },
					})}</Typography
				>
			{:else}
				<span class="headline">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('landingPage.title', {
						values: { colorHigh: `<span class='color-high'>${$_('landingPage.titleHigh')}</span>` },
					})}
				</span>
			{/if}
			<Typography variant="large">{$_('landingPage.subtitle')}</Typography>
		</section>
		{#if !isMobile}
			<section>
				<Button variant="strong" dimension="large" href={routes.SIGNUP}
					>{$_('landingPage.getStarted')}<ArrowRight size={24} /></Button
				>
				<div class="footer">
					<BetaBadge>beta</BetaBadge>
					<Typography variant="small" class="color-high">{$_('landingPage.footer')}</Typography>
				</div>
			</section>
		{:else}
			<div class="warning">
				<WarningFilled class="color-red" size={24} />
				<Typography class="color-red">{$_('landingPage.warning')}</Typography>
			</div>
		{/if}
	</div>
</main>

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
		justify-content: center;
		padding: var(--double-padding);
	}
	.container {
		display: flex;
		flex-direction: column;
		max-width: 1136px;
		width: 100%;
		gap: calc(var(--double-padding) * 2);
		align-items: center;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		width: 100%;
		align-items: center;
		text-align: center;
	}
	.max-width560 {
		max-width: 560px;
	}
	img {
		width: 256px;
		height: auto;
	}
	.headline {
		font-family: var(--font-family-sans-serif);
		font-size: 56px;
		font-weight: bold;
		line-height: 64px;
		font-variant-numeric: lining-nums;
		font-variant-numeric: tabular-nums;
	}
	.footer {
		display: flex;
		align-items: center;
		gap: var(--half-padding);
	}
	.warning {
		display: flex;
		gap: var(--padding);
		align-items: center;
		border: 1px solid var(--colors-red);
		border-radius: var(--half-padding);
		padding: var(--half-padding);
	}
	.mobile {
		padding: var(--padding);
	}
</style>
