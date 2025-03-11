<script lang="ts">
	import { ChatBot, Close, SendAlt } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import Textarea from './ui/textarea.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import { browser } from '$app/environment'
	import Error from './error.svelte'
	import adapter from '$lib/adapters'
	import type { Feedback, MetaFields } from '$lib/types'
	import { page } from '$app/state'

	let { oncancel, open = $bindable(false), ...restProps }: ModalProps = $props()
	let message = $state('')
	const sendDisabled = $derived(message.trim() === '')
	let error: string | undefined = $state()

	async function sendFeedback() {
		error = undefined
		try {
			const email = authStore.user?.email || null
			const pathname = browser ? page.url.pathname : null
			const data = null

			const feedback: Omit<Feedback, MetaFields> = { email, pathname, message, data }

			await adapter.addFeedback(feedback)

			message = ''
			open = false
		} catch (e) {
			console.error(e)
			error = $_('feedbackError')
		}
	}
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
		<Textarea rows={6} bind:value={message} placeholder={$_('feedback.textareaPlaceholder')}
		></Textarea>
		{#if error}
			<Error>{error}</Error>
		{/if}
		<section class="buttons">
			<Button variant="strong" disabled={sendDisabled} dimension="compact" onclick={sendFeedback}
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
