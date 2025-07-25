<script lang="ts">
	import { ArrowRight } from 'carbon-icons-svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Vertical from './ui/vertical.svelte'
	import { _ } from 'svelte-i18n'
	import Button from './ui/button.svelte'
	import YoutubeIntroVideo from './youtube-intro-video.svelte'

	let { oncancel, open = $bindable(false), ...restProps }: ModalProps = $props()

	function close() {
		if (oncancel) oncancel()
	}
</script>

<Modal bind:open {oncancel} {...restProps} --modal-max-width="592px">
	{#if open}
		<Vertical --vertical-gap="0">
			<YoutubeIntroVideo autoplay={true} />
			<Horizontal class="video-button" --horizontal-justify-content="center">
				<Button variant="darkoverlay" dimension="compact" onclick={close}>
					{$_('component.welcome.startUsingKalkul')}
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
	:global(.video-button) {
		background-color: black;
		padding: var(--padding);
	}
</style>
