<script lang="ts">
	import { _ } from 'svelte-i18n'
	import Loader from './ui/loader.svelte'
	import Typography from './ui/typography.svelte'

	interface Props {
		visible: boolean
	}

	let { visible }: Props = $props()
	let show = $state(false)
	let shouldAnimate = $state(false)

	$effect(() => {
		if (visible) {
			show = true
			shouldAnimate = true
		} else if (show) {
			shouldAnimate = false
			setTimeout(() => {
				show = false
			}, 300)
		}
	})
</script>

{#if show}
	<div class="loading-overlay" class:visible={shouldAnimate}>
		<Loader />
		<Typography>{$_('common.calculatingChartData')}</Typography>
	</div>
{/if}

<style>
	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--colors-base);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--half-padding);
		border-radius: var(--border-radius);
		opacity: 1;
		pointer-events: none;
	}

	.loading-overlay:not(.visible) {
		opacity: 0;
		transition: opacity 0.3s ease-out;
	}
</style>
