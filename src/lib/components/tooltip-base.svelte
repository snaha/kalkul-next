<script lang="ts" module>
	import type { TooltipData } from '$lib/types'
	import type { Snippet } from 'svelte'
	import Typography from './ui/typography.svelte'
	export type TooltipGraphProps = {
		labels: string[]
		tooltipData: TooltipData[]
		tooltipPosition: { x: number; y: number }
		children?: Snippet
	}
</script>

<script lang="ts">
	const { labels, tooltipData, tooltipPosition, children }: TooltipGraphProps = $props()
</script>

{#if tooltipData.length > 0}
	<div
		class="tooltip"
		style={`transform: translate(calc(${tooltipPosition.x}px - 100%),calc(${tooltipPosition.y}px - 50%)`}
	>
		<Typography variant="h5" class="color-light">{labels[tooltipData[0].dataIndex]}</Typography>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}

<style>
	:global(.color-light) {
		color: var(--colors-base) !important;
	}
	.tooltip {
		pointer-events: none;
		position: absolute;
		width: 321px;
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		padding: var(--padding);
		border-radius: var(--padding);
		border: 1px solid var(--colors-base);
		background: var(--colors-top);
	}
</style>
