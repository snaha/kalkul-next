<script>
	import { PUBLIC_DISCORD_LINK } from '$env/static/public'
	import ResponsiveLayout from '$lib/components/ui/responsive-layout.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import routes from '$lib/routes'
	import Logo from './icons/logo.svelte'
	import { _ } from 'svelte-i18n'
	import FlexItem from './ui/flex-item.svelte'
	import Typography from './ui/typography.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
</script>

<Vertical class={`footer ${layoutStore.mobile ? `mobile` : ''}`} style="display: flex">
	<ResponsiveLayout --responsive-gap="var(--double-padding)" --responsive-justify-content="center">
		<Logo size={48} color="var(--colors-light-base)"></Logo>
		<a href={PUBLIC_DISCORD_LINK}>Discord</a>
		<a href={routes.TERMS}>{$_('component.footer.termsOfService')}</a>
		<a href={routes.PRIVACY}>{$_('component.footer.privacyPolicy')}</a>
		<FlexItem />
		<Typography --typography-color="var(--colors-light-base)" style="opacity: 0.5"
			>© 2025 Kalkul.app s.r.o.</Typography
		>
	</ResponsiveLayout>
</Vertical>

<style>
	:global(.footer) {
		background-color: var(--colors-dark-base);
		width: 100%;
		max-width: 100%;
		padding: var(--quadruple-padding) 152px;
		flex: 1;
		max-height: 100%;
		height: 100%;
	}
	:global(.footer.mobile) {
		padding: var(--quadruple-padding) var(--double-padding);
	}
	a {
		color: var(--colors-light-base);
		text-decoration: underline;
	}
</style>
