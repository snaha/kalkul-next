<script>
	import { PUBLIC_DISCORD_LINK, PUBLIC_INSTAGRAM_LINK } from '$env/static/public'
	import ResponsiveLayout from '$lib/components/ui/responsive-layout.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import routes from '$lib/routes'
	import Logo from './icons/logo.svelte'
	import { _ } from 'svelte-i18n'
	import FlexItem from './ui/flex-item.svelte'
	import Typography from './ui/typography.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import Button from './ui/button.svelte'
	import Discord from './icons/discord.svelte'
	import Instagram from './icons/instagram.svelte'
</script>

<Vertical class={`footer ${layoutStore.mobile ? `mobile` : ''}`} style="display: flex">
	<ResponsiveLayout --responsive-gap="var(--double-padding)" --responsive-justify-content="center">
		<Logo size={48} color="var(--colors-light-base)"></Logo>
		{#if !layoutStore.mobile}
			<FlexItem />
		{/if}
		<ResponsiveLayout --responsive-gap="var(--half-padding)" --responsive-justify-content="center">
			<Button variant="ghost" mode="dark" href={PUBLIC_DISCORD_LINK} target="_blank"
				><Discord size={24} />Discord</Button
			>
			<Button variant="ghost" mode="dark" href={PUBLIC_INSTAGRAM_LINK} target="_blank"
				><Instagram size={24} />Instagram</Button
			>
			<Button variant="ghost" mode="dark" href={routes.TERMS} target="_blank"
				>{$_('component.footer.termsOfService')}</Button
			>
			<Button variant="ghost" mode="dark" href={routes.PRIVACY} target="_blank"
				>{$_('component.footer.privacyPolicy')}</Button
			>
		</ResponsiveLayout>
		<Typography
			--typography-color="var(--colors-light-base)"
			style="opacity: 0.5; white-space: nowrap;">© 2025 Kalkul.app s.r.o.</Typography
		>
	</ResponsiveLayout>
</Vertical>

<style>
	:global(.footer) {
		background-color: var(--colors-dark-base);
		width: 100%;
		max-width: 100%;
		padding: var(--quadruple-padding) 152px;
	}
	:global(.footer.mobile) {
		padding: var(--quadruple-padding) var(--double-padding);
	}
</style>
