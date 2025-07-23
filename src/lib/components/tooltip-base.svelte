<script lang="ts" module>
	import type { TooltipData } from '$lib/types'
	import type { Snippet } from 'svelte'
	import Typography from './ui/typography.svelte'
	export type TooltipGraphProps = {
		tooltipData: TooltipData[]
		tooltipPosition: { x: number; y: number }
		children?: Snippet
		clientBirthDate?: Date
		year: number
		adjustWithInflation: boolean
	}
</script>

<script lang="ts">
	import { formatAge } from '$lib/utils'
	import { _ } from 'svelte-i18n'
	import Badge from './ui/badge.svelte'
	import { UserAvatarFilledAlt } from 'carbon-icons-svelte'
	import Horizontal from './ui/horizontal.svelte'

	const {
		tooltipData,
		tooltipPosition,
		children,
		clientBirthDate,
		year,
		adjustWithInflation,
	}: TooltipGraphProps = $props()

	function getClientAge(year: number, clientBirthDate?: Date): string | undefined {
		if (!clientBirthDate) {
			return
		}

		// Calculate client age for that year
		const targetDate = new Date(year, 0, 1) // January 1st of the year
		const age = formatAge(clientBirthDate, targetDate)

		return `${$_('common.age')}: ${age}`
	}
</script>

{#if tooltipData.length > 0}
	<div
		class="tooltip"
		style={`transform: translate(calc(${tooltipPosition.x}px - 100%),calc(${tooltipPosition.y}px - 50%)`}
	>
		<div class="tooltip-header">
			<Horizontal --horizontal-gap="var(--half-padding)">
				<Typography variant="h5" class="color-light">{year}</Typography>
				{#if adjustWithInflation}
					<Typography variant="small" --typography-color="var(--colors-dark-high)"
						>{$_('common.inflationAdjusted')}</Typography
					>
				{/if}
			</Horizontal>

			{#if getClientAge(year, clientBirthDate)}
				<Badge dimension="small" class="age-badge">
					<UserAvatarFilledAlt size={16} />
					<Typography variant="small" --typography-color="var(--colors-dark-ultra-high)">
						{getClientAge(year, clientBirthDate)}</Typography
					>
				</Badge>
			{/if}
		</div>
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
		z-index: 10;
	}
	.tooltip-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--half-padding);
	}
	:global(.age-badge) {
		background-color: var(--colors-dark-low) !important;
		color: var(--colors-dark-ultra-high) !important;
	}
</style>
