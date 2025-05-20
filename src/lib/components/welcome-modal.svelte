<script lang="ts">
	import { ArrowRight, Badge } from 'carbon-icons-svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'
	import Typography from './ui/typography.svelte'
	import Vertical from './ui/vertical.svelte'
	import { _ } from 'svelte-i18n'
	import Button from './ui/button.svelte'
	import Youtube from './icons/youtube.svelte'

	let { oncancel, open = $bindable(false), ...restProps }: ModalProps = $props()

	let isVideoPlayer = $state(false)

	function close() {
		if (oncancel) oncancel()
		isVideoPlayer = false
	}

	function startVideoPlayer(e: Event) {
		e.stopPropagation()
		isVideoPlayer = true
	}
</script>

<Modal bind:open {oncancel} {...restProps} --modal-max-width="592px">
	{#if isVideoPlayer && open}
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
					{$_('Start testing')}
					<ArrowRight size={24} />
				</Button>
			</Horizontal>
		</Vertical>
	{:else}
		<Vertical class="content">
			<Typography variant="h5" class="text-center">{$_('Welcome to Kalkul beta!')}</Typography>
			<Typography variant="large" class="text-center" --letter-spacing-large="var(--letter-spacing)"
				>{$_(
					'Kalkul helps independent advisors create, visualise and share financial plans with their clients.',
				)}</Typography
			>
			<Typography class="text-center"
				>{$_(
					'The app is currently in Free beta version, and will launch as a commercial product later this year. As a beta user, you have early access to the app as we develop it. We’re looking forward to your feedback — help us shape the future of independent financial planning!',
				)}</Typography
			>
			<Horizontal class="green box" --horizontal-justify-content="center">
				<Badge size={24} />
				<Typography bold --typography-color="var(--colors-high)"
					>{$_('As a beta user, you will be eligible for special discounts!')}</Typography
				>
			</Horizontal>
			<Horizontal --horizontal-justify-content="center">
				<Button variant="strong" dimension="compact" onclick={startVideoPlayer}>
					<Youtube size={24} color="var(--colors-ultra-high)" />
					{$_('Watch video intro')}
				</Button>
				<Button variant="secondary" dimension="compact" onclick={close}>
					{$_('Start testing')}
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
