<script lang="ts">
	import { ArrowRight } from 'carbon-icons-svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Vertical from './ui/vertical.svelte'
	import { _ } from 'svelte-i18n'
	import Button from './ui/button.svelte'

	let { oncancel, open = $bindable(false), ...restProps }: ModalProps = $props()

	function close() {
		if (oncancel) oncancel()
	}
</script>

<Modal bind:open {oncancel} {...restProps} --modal-max-width="592px">
	{#if open}
		<Vertical --vertical-gap="0">
			<div class="video">
				<iframe
					src="https://www.youtube.com/embed/0WOElk__PU0?autoplay=1"
					class="video"
					title="intro video"
				>
				</iframe>
			</div>
			<Horizontal class="video-button" --horizontal-justify-content="center">
				<Button variant="darkoverlay" dimension="compact" onclick={close}>
					{$_('component.videoModal.startUsingKalkul')}
					<ArrowRight size={24} />
				</Button>
			</Horizontal>
		</Vertical>
	{/if}
</Modal>

<style>
	:global(.content) {
		padding: var(--padding);
		max-width: 592px;
		width: 100%;
	}
	:global(.text-center) {
		text-align: center;
	}
	:global(.box) {
		border-radius: var(--one-and-a-half-padding);
		padding: var(--three-quarters-padding);
		gap: 10px;
	}
	:global(.green) {
		background-color: color-mix(in srgb, var(--colors-high) 10%, transparent);
		color: var(--colors-high);
	}
	.video {
		background-color: black;
		width: 100%;
		max-width: 100%;
		aspect-ratio: 16 / 9;
		border: 0;
	}
	:global(.video-button) {
		background-color: black;
		padding: var(--padding);
	}
</style>
