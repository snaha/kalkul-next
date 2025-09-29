<script>
	import { Close } from 'carbon-icons-svelte'
	import Logo from './icons/logo.svelte'
	import Button from './ui/button.svelte'
	import routes from '$lib/routes'
	import Horizontal from './ui/horizontal.svelte'
	import BetaBadge from './beta-badge.svelte'

	let { hasCloseButton = true, beta = false } = $props()
</script>

<header>
	<Horizontal --horizontal-gap="var(--half-padding)">
		<a class="logo-link clickable" href={routes.HOME}>
			<Logo size={40} />
		</a>
		{#if beta}
			<BetaBadge>beta</BetaBadge>
		{/if}
	</Horizontal>
	{#if hasCloseButton}
		<Button dimension="compact" variant="ghost" class="clickable" onclick={() => history.back()}>
			<Close size={24} />
		</Button>
	{:else}
		<div class="spacer"></div>
	{/if}
</header>

<style>
	:root {
		--header-height: 106px;
	}
	header {
		width: 100%;
		padding: var(--double-padding);
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: var(--header-position, fixed);
		top: 0;
		background-color: var(--header-background-color, var(--colors-ultra-low));
		pointer-events: var(--header-pointer-events, initial);
		z-index: 1;
	}
	@media screen and (max-width: 760px) {
		header {
			position: var(--header-position, sticky);
			background-color: var(--colors-ultra-low);
			padding: var(--padding);
			pointer-events: initial;
		}
	}
	.logo-link {
		display: flex;
		color: var(--colors-ultra-high);
	}
	:global(.clickable) {
		pointer-events: initial;
	}
	.spacer {
		flex: 1;
	}
</style>
