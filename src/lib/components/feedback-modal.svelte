<script lang="ts">
	import { ChatBot, Close, SendAlt } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import Textarea from './ui/textarea.svelte'

	type Props = {
		confirm: () => void
	}
	let { oncancel, confirm, open = $bindable(false), ...restProps }: ModalProps & Props = $props()
	let message = $state('')
	const sendDisabled = $derived(message.trim() === '')
</script>

<Modal bind:open {oncancel} {...restProps}>
	<section class="dialog">
		<header class="horizontal">
			<div class="title">
				<ChatBot size={24} />
				<Typography variant="h5">{$_('feedback.title')}</Typography>
			</div>
			<div class="grower"></div>
			<Button variant="ghost" dimension="compact" onclick={oncancel}><Close size={24} /></Button>
		</header>

		<Typography>{$_('feedback.text')}</Typography>
		<Textarea bind:value={message} placeholder={$_('feedback.textareaPlaceholder')}></Textarea>
		<section class="buttons">
			<Button variant="strong" disabled={sendDisabled} dimension="compact" onclick={confirm}
				><SendAlt size={24} />{$_('feedback.confirmButton')}</Button
			>
			<Button variant="secondary" dimension="compact" onclick={oncancel}
				><Close size={24} />{$_('feedback.cancelButton')}</Button
			>
			<div class="grower"></div>
		</section>
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
	.buttons {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--half-padding);
	}
	@media screen and (max-width: 624px) {
		.buttons {
			flex-direction: column-reverse;
			align-items: stretch;
		}
	}
	.grower {
		flex-grow: 1;
	}
</style>
