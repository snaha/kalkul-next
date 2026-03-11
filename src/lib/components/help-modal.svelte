<script lang="ts">
	import { ChatBot, Close } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'

	let { oncancel, open = $bindable(false), ...restProps }: ModalProps = $props()

	function close() {
		if (oncancel) oncancel()
	}
</script>

<Modal bind:open oncancel={close} {...restProps}>
	<section class="dialog">
		<header class="horizontal">
			<div class="title">
				<ChatBot size={24} />
				<Typography variant="h5">{$_('component.help.title')}</Typography>
			</div>
			<div class="grower"></div>
			<Button variant="ghost" dimension="compact" onclick={close}><Close size={24} /></Button>
		</header>
		<Typography>
			{$_('component.help.text')}
		</Typography>
	</section>
</Modal>

<style lang="postcss">
	.dialog {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--padding);
		background-color: var(--colors-base);
		padding: var(--padding);
		height: 100%;
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		width: 100%;
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--half-padding);
	}
	.title {
		display: flex;
		gap: var(--half-padding);
	}
	.grower {
		flex-grow: 1;
	}
</style>
