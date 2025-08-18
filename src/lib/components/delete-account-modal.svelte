<script lang="ts">
	import { Close, WarningFilled } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Typography from './ui/typography.svelte'
	import Vertical from './ui/vertical.svelte'
	import { _ } from 'svelte-i18n'

	let { oncancel, open = $bindable(false), ...restProps }: ModalProps = $props()

	function close() {
		open = false
		if (oncancel) oncancel()
	}
</script>

<Modal bind:open oncancel={close} {...restProps}>
	<Vertical --vertical-gap="var(--padding)" class="dialog">
		<Horizontal --horizontal-justify-content="space-between" --horizontal-align-items="center">
			<Horizontal --horizontal-gap="var(--half-padding)" --horizontal-align-items="center">
				<WarningFilled size={24} />
				<Typography variant="h5">{$_('page.account.deleteAccountModalTitle')}</Typography>
			</Horizontal>
			<Button variant="ghost" dimension="compact" onclick={close}><Close size={24} /></Button>
		</Horizontal>
		<Typography>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $_('page.account.deleteAccountModalText', {
				values: {
					email: `<a href="mailto:support@kalkul.app" class="email-link">support@kalkul.app</a>`,
				},
			})}
		</Typography>
	</Vertical>
</Modal>

<style lang="postcss">
	:global(.dialog) {
		padding: var(--padding);
	}
	:global(.email-link) {
		color: var(--colors-high) !important;
		text-decoration: none !important;
	}
	:global(.email-link:hover) {
		text-decoration: underline !important;
	}
</style>
