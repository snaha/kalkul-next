<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Logo from '$lib/components/icons/logo.svelte'
	import { Moon } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Typography from './ui/typography.svelte'
	import { notImplemented } from '$lib/not-implemented'
	import routes from '$lib/routes'
	import BetaBadge from './beta-badge.svelte'
</script>

<header>
	<div class="left">
		<a class="logo-link" href={routes.HOME}>
			<Logo size={32} />
		</a>
		<BetaBadge>BETA</BetaBadge>
	</div>
	<div class="user-info">
		<Typography variant="small" --colors-ultra-high="var(--colors-dark-ultra-high)">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $_('component.viewHeader.madeWithKalkul', {
				values: { link: `<a class="link" href=${routes.HOME}>kalkul.app</a>` },
			})}</Typography
		>
		<Button mode="dark" dimension="small" variant="ghost" onclick={notImplemented}
			><Moon size={16} /></Button
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
		color: var(--colors-dark-ultra-high);
		text-decoration: underline;
	}
</style>
