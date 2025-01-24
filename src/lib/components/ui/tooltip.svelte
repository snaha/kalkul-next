<script lang="ts" module>
	import type { Snippet } from 'svelte'

	type Position = 'top' | 'bottom' | 'left' | 'right'
	export interface Props {
		children?: Snippet
		helperText?: Snippet | string
		position?: Position
		large?: boolean
		show?: boolean
	}
</script>

<script lang="ts">
	let { position = 'top', children, helperText, large = false, show = false }: Props = $props()
	let tooltip: HTMLDivElement | undefined = $state(undefined)
	let element: HTMLDivElement | undefined = $state(undefined)

	$effect(() => {
		// Update tooltip position when large or show changes
		large // eslint-disable-line @typescript-eslint/no-unused-expressions
		show // eslint-disable-line @typescript-eslint/no-unused-expressions

		updateTooltipPosition()
		window.addEventListener('resize', updateTooltipPosition)
		window.addEventListener('scroll', updateTooltipPosition)

		return () => {
			window.removeEventListener('resize', updateTooltipPosition)
			window.removeEventListener('scroll', updateTooltipPosition)
		}
	})
	function updateTooltipPosition() {
		if (tooltip && element) {
			const elementRect = element.getBoundingClientRect()
			const tooltipRect = tooltip.getBoundingClientRect()

			const padding = 8
			// Set tooltip initial position
			let top = 0,
				left = 0
			if (position === 'top') {
				top = elementRect.top - tooltipRect.height - padding
				left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2
			} else if (position === 'bottom') {
				top += elementRect.bottom + padding
				left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2
			} else if (position === 'left') {
				top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2
				left = elementRect.left - tooltipRect.width - padding
			} else if (position === 'right') {
				top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2
				left = elementRect.right + padding
			}

			// Check and adjust position if out of screen
			if (top < 0) {
				top = elementRect.bottom - padding
			}
			if (left < 0) {
				left = elementRect.right - padding
			}
			if (top + tooltipRect.height > window.innerHeight) {
				top = elementRect.top - tooltipRect.height + padding
			}
			if (left + tooltipRect.width > window.innerWidth) {
				left = elementRect.left - tooltipRect.width + padding
			}

			tooltip.style.top = `${top}px`
			tooltip.style.left = `${left}px`
		}
	}
</script>

<div class="tooltip">
	{#if show}
		<div class="tooltip-text" class:large bind:this={tooltip}>
			{#if helperText}
				{#if typeof helperText === 'string'}
					{helperText}
				{:else}
					{@render helperText()}
				{/if}
			{/if}
		</div>
	{/if}
	{#if children}
		<div class="tooltip-trigger" class:show bind:this={element}>
			{@render children()}
		</div>
	{/if}
</div>

<style lang="postcss">
	.tooltip {
		.tooltip-trigger {
			display: flex;
			cursor: help;
		}
		&:has(.tooltip-trigger:hover),
		&:has(.show) {
			.tooltip-text {
				opacity: 1;
			}
		}
		.tooltip-text {
			position: fixed;
			opacity: 0;
			border-radius: 0.75rem;
			background-color: var(--colors-top);
			padding: var(--quarter-padding) var(--half-padding);
			color: var(--colors-base);
			font-size: var(--font-size-small);
			line-height: var(--line-height-small);
			font-family: var(--font-family-sans-serif);
			letter-spacing: var(--letter-spacing-small);
			white-space: nowrap;

			&.large {
				border-radius: 1.25rem;
				padding: var(--quarter-padding) var(--half-padding);
				font-size: var(--font-size);
				line-height: var(--line-height);
				letter-spacing: var(--letter-spacing);
			}
		}
	}
</style>
