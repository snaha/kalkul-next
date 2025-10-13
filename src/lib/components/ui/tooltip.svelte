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
	let adjustedPosition = $state(position)

	function updatePosition() {
		if (show && tooltip && element) {
			requestAnimationFrame(() => {
				if (!tooltip || !element) return

				const elementRect = element.getBoundingClientRect()
				const tooltipRect = tooltip.getBoundingClientRect()
				const padding = 8

				// Calculate available space in all directions
				const spaceTop = elementRect.top
				const spaceBottom = window.innerHeight - elementRect.bottom
				const spaceLeft = elementRect.left
				const spaceRight = window.innerWidth - elementRect.right

				// Calculate required space for tooltip in each direction
				const requiredTop = tooltipRect.height + padding
				const requiredBottom = tooltipRect.height + padding
				const requiredLeft = tooltipRect.width + padding
				const requiredRight = tooltipRect.width + padding

				// For top/bottom positions, also check horizontal centering
				const centeredLeft = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2
				const horizontalOverflow =
					centeredLeft < 0 || centeredLeft + tooltipRect.width > window.innerWidth

				// Try positions in order of preference based on original position
				let bestPosition = position

				if (position === 'top') {
					if (spaceTop >= requiredTop && !horizontalOverflow) {
						bestPosition = 'top'
					} else if (spaceBottom >= requiredBottom && !horizontalOverflow) {
						bestPosition = 'bottom'
					} else if (spaceLeft >= requiredLeft) {
						bestPosition = 'left'
					} else if (spaceRight >= requiredRight) {
						bestPosition = 'right'
					} else if (spaceBottom >= requiredBottom) {
						bestPosition = 'bottom'
					}
				} else if (position === 'bottom') {
					if (spaceBottom >= requiredBottom && !horizontalOverflow) {
						bestPosition = 'bottom'
					} else if (spaceTop >= requiredTop && !horizontalOverflow) {
						bestPosition = 'top'
					} else if (spaceLeft >= requiredLeft) {
						bestPosition = 'left'
					} else if (spaceRight >= requiredRight) {
						bestPosition = 'right'
					} else if (spaceTop >= requiredTop) {
						bestPosition = 'top'
					}
				} else if (position === 'left') {
					if (spaceLeft >= requiredLeft) {
						bestPosition = 'left'
					} else if (spaceRight >= requiredRight) {
						bestPosition = 'right'
					} else if (spaceTop >= requiredTop && !horizontalOverflow) {
						bestPosition = 'top'
					} else if (spaceBottom >= requiredBottom && !horizontalOverflow) {
						bestPosition = 'bottom'
					}
				} else if (position === 'right') {
					if (spaceRight >= requiredRight) {
						bestPosition = 'right'
					} else if (spaceLeft >= requiredLeft) {
						bestPosition = 'left'
					} else if (spaceTop >= requiredTop && !horizontalOverflow) {
						bestPosition = 'top'
					} else if (spaceBottom >= requiredBottom && !horizontalOverflow) {
						bestPosition = 'bottom'
					}
				}

				adjustedPosition = bestPosition
			})
		} else {
			adjustedPosition = position
		}
	}

	$effect(() => {
		updatePosition()

		if (show) {
			window.addEventListener('resize', updatePosition)
			window.addEventListener('scroll', updatePosition)

			return () => {
				window.removeEventListener('resize', updatePosition)
				window.removeEventListener('scroll', updatePosition)
			}
		}
	})
</script>

<div class="tooltip">
	{#if children}
		<div class="tooltip-trigger" class:show bind:this={element}>
			{@render children()}
		</div>
	{/if}
	{#if show}
		<div
			class="tooltip-text"
			class:large
			class:position-top={adjustedPosition === 'top'}
			class:position-bottom={adjustedPosition === 'bottom'}
			class:position-left={adjustedPosition === 'left'}
			class:position-right={adjustedPosition === 'right'}
			bind:this={tooltip}
		>
			{#if helperText}
				{#if typeof helperText === 'string'}
					{helperText}
				{:else}
					{@render helperText()}
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	.tooltip {
		position: relative;
		display: inline-flex;

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
			position: absolute;
			opacity: 0;
			background-color: var(--colors-top);
			padding: var(--quarter-padding) var(--half-padding);
			color: var(--colors-base);
			font-size: var(--font-size-small);
			line-height: var(--line-height-small);
			font-family: var(--font-family-sans-serif);
			letter-spacing: var(--letter-spacing-small);
			z-index: 100;
			border-radius: 0.75rem;
			transition: opacity 0.2s ease;
			max-width: 300px;
			min-width: 300px;
			overflow: visible;

			&.large {
				border-radius: 1.25rem;
				padding: var(--quarter-padding) var(--half-padding);
				font-size: var(--font-size);
				line-height: var(--line-height);
				letter-spacing: var(--letter-spacing);
				max-width: min(500px, 80vw);
				width: max-content;
				white-space: normal;
			}
		}

		.position-top {
			bottom: 100%;
			left: 50%;
			transform: translateX(-50%);
			margin-bottom: 8px;
		}

		.position-bottom {
			top: 100%;
			left: 50%;
			transform: translateX(-50%);
			margin-top: 8px;
		}

		.position-left {
			right: 100%;
			top: 50%;
			transform: translateY(-50%);
			margin-right: 8px;
		}

		.position-right {
			left: 100%;
			top: 50%;
			transform: translateY(-50%);
			margin-left: 8px;
		}
	}
</style>
