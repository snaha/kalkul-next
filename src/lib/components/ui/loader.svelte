<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'
	type Color = 'high' | 'low'
	type Dimension = 'default' | 'large' | 'compact' | 'small'
	type Props = {
		dimension?: Dimension
		color?: Color
	}
	let {
		dimension = 'default',
		color = 'high',
		...restProps
	}: Props & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div class="loader {dimension} {color}" {...restProps}></div>

<style lang="postcss">
	.loader {
		animation: spin 1s linear infinite;
		border-radius: 50%;
		&.high {
			border: 2px solid var(--colors-ultra-high);
			border-top: 2px solid transparent;
		}
		&.low {
			border: 2px solid var(--colors-ultra-low);
			border-top: 2px solid transparent;
		}
		&.default,
		&.compact,
		&.small {
			width: 1rem;
			height: 1rem;
		}
		&.large {
			width: 1.5rem;
			height: 1.5rem;
		}
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
