<script lang="ts">
	import { Badge, ArrowRight } from 'carbon-icons-svelte'
	import BetaBadge from '$lib/components/beta-badge.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import { _ } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { base } from '$app/paths'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Banner from '$lib/components/banner.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
</script>

{#snippet icon()}
	<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
	<Badge size={24} />
{/snippet}
{#snippet disclaimer()}
	<BetaBadge>beta</BetaBadge>
	<Typography variant="small" class="color-high">{$_('page.moneyfest.disclaimer')}</Typography>
{/snippet}
<main class:mobile={layoutStore.mobile}>
	<Vertical
		class="max-width560 text-align-center"
		--vertical-gap="var(--padding)"
		--vertical-justify-content="center"
		--vertical-align-items="center"
	>
		<Vertical --vertical-gap="var(--padding)">
			<img src={`${base}/images/manifest-kalkul.svg`} alt={$_('common.introImg')} />
			<img src={`${base}/images/manifest-kalkul-collaboration.svg`} alt={$_('common.introImg')} />
		</Vertical>
		<Vertical --vertical-gap="var(--half-padding)">
			<Banner --banner-padding="var(--half-padding)" --banner-border-radius="1000px" {icon}>
				<Typography style="color: var(--colors-high); font-weight: 700;">
					{$_('page.moneyfest.cta')}
				</Typography>
			</Banner>
			<Typography variant="large">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html $_('page.moneyfest.title')}</Typography
			>
			<Typography>
				{$_('page.moneyfest.subtitle')}</Typography
			>
		</Vertical>

		<Button variant="strong" href={routes.SIGNUP}
			>{$_('page.moneyfest.button')}<ArrowRight size={24} /></Button
		>

		{#if layoutStore.mobile}
			<Vertical --vertical-gap="var(--half-padding)">
				{@render disclaimer()}
			</Vertical>
		{:else}
			<Horizontal --horizontal-gap="var(--half-padding)">
				{@render disclaimer()}
			</Horizontal>
		{/if}
	</Vertical>
</main>

<style>
	:global(.color-high) {
		color: var(--colors-high) !important;
	}
	:global(.color-red) {
		color: var(--colors-red) !important;
	}
	main {
		display: flex;
		width: 100%;
		justify-content: center;
		padding: var(--double-padding);
	}
	:global(.max-width560) {
		max-width: 560px;
		width: 100%;
	}
	:global(.text-align-center) {
		text-align: center;
	}
	:global(.rounded-box) {
		border-radius: var(--quarter-padding);
		padding: var(--padding);
	}
	:global(.trans-green-10) {
		background-color: rgb(from var(--colors-high) r g b / 0.1) !important;
	}
	img {
		width: 256px;
		height: auto;
	}
	.mobile {
		padding: var(--padding);
	}
</style>
