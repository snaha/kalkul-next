<script lang="ts">
	import { CheckmarkFilled, UserAvatar } from 'carbon-icons-svelte'
	import BetaBadge from './beta-badge.svelte'
	import Logo from './icons/logo.svelte'
	import Button from './ui/button.svelte'
	import { _, locale } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { base } from '$app/paths'
	import Typography from './ui/typography.svelte'
	import Input from './ui/input/input.svelte'
	import { notImplemented } from '$lib/not-implemented'
	import { z } from 'zod'
	import ErrorComponent from './error.svelte'
	import Vertical from './ui/vertical.svelte'
	import Banner from './banner.svelte'
	import Footer from './footer.svelte'

	type Props = {
		isMobile: boolean
	}

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	const { isMobile }: Props = $props()
	let email = $state('')
	let emailValid = $state(true)
	let isSubscribing = $state(false)
	let subscribed = $state(false)

	async function onSubscribe() {
		isSubscribing = true
		// TODO: handle errors, subscribe etc
		await sleep(1000)
		notImplemented()

		if (emailValid && email !== '') {
			subscribed = true
			isSubscribing = false
		}
	}

	function validateEmail() {
		return z.string().email().safeParse(email).success || email === ''
	}
</script>

{#snippet emailError()}
	{$_('error.emailError')}
{/snippet}

<header class:mobile={isMobile}>
	<div class="left">
		<Logo size={48} />
		<BetaBadge>beta</BetaBadge>
	</div>
	<div class="right">
		<Button variant="ghost" onclick={() => ($locale = $locale === 'en' ? 'cs' : 'en')}>
			{#if $locale === 'en'}
				CZ
			{:else}
				EN
			{/if}
		</Button>
		<Button variant="secondary" href={routes.LOGIN}
			><UserAvatar size={24} />{$_('common.login')}</Button
		>
	</div>
</header>
<main class:mobile={isMobile}>
	<Vertical
		class="max-width560"
		--vertical-gap="var(--double-padding)"
		--vertical-justify-content="center"
		--vertical-align-items="center"
	>
		<img src={`${base}/images/beta-landing-page.svg`} alt="Intro img" />
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

		<Vertical --vertical-gap="var(--half-padding)">
			<BetaBadge>beta</BetaBadge>
			<Typography class="color-high">{$_('page.landing.betaDisclaimer')}</Typography>
		</Vertical>

		{#if subscribed}
			{#snippet icon()}
				<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
				<CheckmarkFilled size={48 as any} />
			{/snippet}
			<Banner {icon}>
				<Typography>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('page.landing.subscribedText', {
						values: { colorHigh: `<span class='color-high'>${email}</span>` },
					})}
				</Typography>
			</Banner>
		{:else}
			<Vertical
				--vertical-gap="var(--padding)"
				--vertical-align-items="stretch"
				--vertical-justify-content="stretch"
			>
				<Vertical
					--vertical-gap="var(--half-padding)"
					--vertical-align-items="stretch"
					--vertical-justify-content="stretch"
				>
					<div class="cta" class:vertical={isMobile}>
						<Input
							placeholder={$_('page.landing.ctaEmailPlaceholder')}
							type="email"
							variant="solid"
							class="email-input"
							bind:value={email}
							error={!emailValid && isMobile ? emailError : undefined}
							disabled={isSubscribing}
							onblur={() => {
								emailValid = validateEmail()
							}}
							oninput={() => {
								emailValid = emailValid || validateEmail()
							}}
						/><Button
							variant="strong"
							onclick={onSubscribe}
							disabled={!emailValid || email === '' || isSubscribing}
							>{$_(
								isSubscribing
									? 'page.landing.ctaEmailSubmitLoading'
									: 'page.landing.ctaEmailSubmit',
							)}</Button
						>
					</div>
					{#if !emailValid && !isMobile}
						<ErrorComponent>{@render emailError()}</ErrorComponent>
					{/if}
				</Vertical>
				<Typography variant="small" style="text-align: start">
					{$_('page.landing.ctaDisclaimer')}
				</Typography>
			</Vertical>
		{/if}
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
		justify-content: center;
		padding: var(--double-padding);
	}
	:global(.max-width560) {
		max-width: 560px;
		text-align: center;
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
	.mobile {
		padding: var(--padding);
	}
	.cta {
		display: flex;
		flex-direction: row;
		width: 100%;
		gap: var(--half-padding);
		align-items: center;
		justify-content: stretch;

		:global(.email-input) {
			flex-grow: 1;
		}

		&.vertical {
			flex-direction: column;
			align-items: stretch;
			justify-content: stretch;
		}
	}
</style>
