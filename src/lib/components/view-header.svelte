<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Logo from '$lib/components/icons/logo.svelte'
	import { ChatBot, Moon } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Typography from './ui/typography.svelte'
	import { notImplemented } from '$lib/not-implemented'
	import FeedbackModal from './feedback-modal.svelte'
	import routes from '$lib/routes'
	import BetaBadge from './beta-badge.svelte'

	let showFeedbackModal = $state(false)
</script>

<header>
	<div class="left">
		<a class="logo-link" href={routes.HOME}>
			<Logo size={32} />
		</a>
		<BetaBadge>BETA</BetaBadge>
	</div>
	<div class="user-info">
		<Typography variant="small" --colors-ultra-high="var(--colors-ultra-low)"
			>{$_('Made with ')}<a href={routes.HOME}>kalkul.app</a></Typography
		>
		<Button mode="dark" dimension="small" variant="ghost" onclick={() => (showFeedbackModal = true)}
			><ChatBot size={16} /></Button
		>
		<Button mode="dark" dimension="small" variant="ghost" onclick={notImplemented}
			><Moon size={16} /></Button
		>
	</div>
</header>
<FeedbackModal bind:open={showFeedbackModal} oncancel={() => (showFeedbackModal = false)} />

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
	a {
		color: var(--colors-ultra-low);
	}
	a:hover {
		text-decoration: none;
	}
</style>
