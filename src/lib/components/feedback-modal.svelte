<script lang="ts">
	import { ArrowRight, ChatBot, Checkmark, Close, Reset, SendAlt } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import Textarea from './ui/textarea.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import { browser } from '$app/environment'
	import adapter from '$lib/adapters'
	import type { Feedback, MetaFields } from '$lib/types'
	import { page } from '$app/state'
	import { base } from '$app/paths'
	import { PUBLIC_DISCORD_LINK } from '$env/static/public'

	let { oncancel, open = $bindable(false), ...restProps }: ModalProps = $props()
	let message = $state('')
	const sendDisabled = $derived(message.trim() === '')
	let error = $state(false)
	let success = $state(false)

	async function sendFeedback() {
		error = false
		success = false
		try {
			const email = authStore.user?.email || null
			const pathname = browser ? page.url.pathname : null
			const data = null

			const feedback: Omit<Feedback, MetaFields> = { email, pathname, message, data }

			await adapter.addFeedback(feedback)

			success = true
		} catch (e) {
			console.error(e)
			error = true
		}
	}
	function close() {
		message = ''
		success = false
		error = false
		if (oncancel) oncancel()
	}
</script>

<Modal bind:open oncancel={close} {...restProps}>
	<section class="dialog">
		<header class="horizontal">
			<div class="title">
				<ChatBot size={24} />
				<Typography variant="h5">{$_('feedback.title')}</Typography>
			</div>
			<div class="grower"></div>
			<Button variant="ghost" dimension="compact" onclick={close}><Close size={24} /></Button>
		</header>
		{#if success}
			<img src={`${base}/images/feedback-success.svg`} alt="Feedback success" class="center" />
			<div class="text">
				<Typography variant="h4">{$_('feedback.success')}</Typography>
				<Typography>{$_('feedback.successText')}</Typography>
			</div>
			<Button
				class="fit-content"
				variant="strong"
				dimension="compact"
				onclick={() => {
					message = ''
					success = false
					open = false
				}}><Checkmark size={24} />{$_('feedback.done')}</Button
			>
		{:else if error}
			<img src={`${base}/images/feedback-error.svg`} alt="Feedback error" class="center" />
			<div class="text error">
				<Typography variant="h4">{$_('feedback.error')}</Typography>
				<Typography>{$_('feedback.errorText')}</Typography>
			</div>
			<Button
				class="fit-content"
				variant="strong"
				dimension="compact"
				onclick={(e: Event) => {
					e.stopPropagation()
					error = false
				}}><Reset size={24} />{$_('feedback.tryAgain')}</Button
			>
		{:else}
			<Typography>{$_('feedback.text')}</Typography>
			<Textarea rows={6} bind:value={message} placeholder={$_('feedback.textareaPlaceholder')}
			></Textarea>
			<section class="buttons">
				<Button variant="strong" disabled={sendDisabled} dimension="compact" onclick={sendFeedback}
					><SendAlt size={24} />{$_('feedback.confirmButton')}</Button
				>
				<div class="grower"></div>
				<div class="right">
					<Typography>{$_('feedback.needHelp')}</Typography>
					<Button variant="secondary" dimension="compact" href={PUBLIC_DISCORD_LINK} target="_blank"
						>{$_('feedback.communityPage')}<ArrowRight size={24} /></Button
					>
				</div>
			</section>
		{/if}
	</section>
</Modal>

<style lang="postcss">
	:global(.fit-content) {
		width: fit-content;
		margin: 0 auto;
	}
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
	.buttons {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--half-padding);
	}
	.grower {
		flex-grow: 1;
	}
	.right {
		display: flex;
		align-items: center;
		gap: var(--half-padding);
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		align-items: center;
		text-align: center;
	}
	.center {
		margin: 0 auto;
	}
	@media screen and (max-width: 624px) {
		.buttons {
			flex-direction: column-reverse;
			align-items: stretch;
		}
		.right {
			flex-direction: column;
			text-align: start;
			align-items: stretch;
		}
	}
</style>
