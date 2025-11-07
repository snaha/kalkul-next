<script lang="ts">
	import { _ } from 'svelte-i18n'
	import Modal from './ui/modal.svelte'
	import Typography from './ui/typography.svelte'
	import Button from './ui/button.svelte'
	import Vertical from './ui/vertical.svelte'
	import Horizontal from './ui/horizontal.svelte'

	let {
		open = $bindable(false),
		onsubscribe,
		onskip,
		oncancel = () => {},
	}: {
		open?: boolean
		onsubscribe: () => void
		onskip: () => void
		oncancel?: () => void
	} = $props()
</script>

<Modal bind:open {oncancel}>
	<section class="dialog">
		<Horizontal --horizontal-justify-content="space-between" --horizontal-align-items="center">
			<Typography variant="h5">{$_('page.signUp.newsletterModal.title')}</Typography>
		</Horizontal>

		<Vertical --vertical-gap="var(--padding)">
			<Typography>{$_('page.signUp.newsletterModal.description')}</Typography>

			<Horizontal --horizontal-gap="var(--half-padding)">
				<Button variant="strong" dimension="compact" onclick={onsubscribe}>
					{$_('page.signUp.newsletterModal.subscribe')}
				</Button>
				<Button variant="ghost" dimension="compact" onclick={onskip}>
					{$_('page.signUp.newsletterModal.dontSubscribe')}
				</Button>
			</Horizontal>
		</Vertical>
	</section>
</Modal>

<style>
	.dialog {
		display: flex;
		flex-direction: column;
		gap: var(--one-and-a-half-padding);
		padding: var(--padding);
		max-width: 100%;
	}
</style>
