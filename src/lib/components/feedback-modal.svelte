<script lang="ts">
	import { ArrowRight, ChatBot, Close } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { PUBLIC_DISCORD_LINK } from '$env/static/public'
	import Discord from './icons/discord.svelte'

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
				<Typography variant="h5">{$_('component.feedback.title')}</Typography>
			</div>
			<div class="grower"></div>
			<Button variant="ghost" dimension="compact" onclick={close}><Close size={24} /></Button>
		</header>
		<Typography>{$_('component.feedback.text')}</Typography>
		<Button variant="strong" dimension="compact" href={PUBLIC_DISCORD_LINK} target="_blank"
			><Discord size={24} />
			{$_('component.feedback.joinTheConversation')}<ArrowRight size={24} /></Button
		>

		<Typography variant="small">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $_('component.feedback.sendUsEmail', {
				values: {
					email: `<a href="mailto:support@kalkul.app">support@kalkul.app</a>`,
				},
			})}</Typography
		>
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
	.grower {
		flex-grow: 1;
	}
</style>
