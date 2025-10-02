<script lang="ts">
	import Logo from '$lib/components/icons/logo.svelte'
	import { _ } from 'svelte-i18n'
	import Typography from './ui/typography.svelte'
	import routes from '$lib/routes'
	import Horizontal from './ui/horizontal.svelte'

	type Props = {
		portfolioName?: string
	}

	let { portfolioName }: Props = $props()
</script>

<header>
	<Horizontal>
		<div class="left">
			<a class="logo-link" href={routes.HOME}>
				<Logo size={32} />
			</a>
		</div>
		{#if portfolioName}
			<Typography variant="small" --colors-ultra-high="var(--colors-dark-ultra-high)">
				{portfolioName}
			</Typography>
		{/if}
	</Horizontal>
	<div class="user-info">
		<Typography variant="small" --colors-ultra-high="var(--colors-dark-ultra-high)">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $_('component.viewHeader.madeWithKalkul', {
				values: { link: `<a class="link" href=${routes.HOME}>kalkul.app</a>` },
			})}</Typography
		>
	</div>
</header>

<style lang="postcss">
	header {
		padding: var(--half-padding);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--colors-dark-ultra-low);
		color: var(--colors-dark-ultra-high);
	}
	.left {
		display: flex;
		align-items: center;
		gap: var(--quarter-padding);
	}
	.logo-link {
		display: flex;
		color: var(--colors-dark-ultra-high);
	}
	.user-info {
		display: flex;
		gap: var(--half-padding);
		align-items: center;
	}
	:global(.link) {
		color: var(--colors-dark-high);
		text-decoration: underline;
	}
</style>
