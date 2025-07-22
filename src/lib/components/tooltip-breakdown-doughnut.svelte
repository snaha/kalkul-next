<script lang="ts">
	import { SERIES_COLORS } from '$lib/colors'
	import { formatCurrency } from '$lib/utils'
	import type { TooltipGraphProps } from './tooltip-base.svelte'
	import TooltipBase from './tooltip-base.svelte'
	import Typography from './ui/typography.svelte'

	interface Props extends TooltipGraphProps {
		currency: string
		doughnutData: { value: number; label: string; colorIndex: number }[]
	}

	const { tooltipData, currency, doughnutData, ...restProps }: Props = $props()

	const totalValue = $derived(
		Array.isArray(doughnutData) ? doughnutData.reduce((sum, item) => sum + item.value, 0) : 0,
	)
</script>

<TooltipBase {tooltipData} {...restProps}>
	<div class="col">
		{#each doughnutData.filter((item) => item.value > 0).sort((a, b) => b.value - a.value) as item}
			<div class="investment-details">
				<div class="color-with-name">
					<div class="color-box" style="background-color: {SERIES_COLORS[item.colorIndex]}"></div>
					<Typography variant="small" class="color-light">{item.label}</Typography>
				</div>
				<div class="value-with-percentage">
					<Typography variant="small" class="color-light">
						{totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0'}%
					</Typography>
					<Typography variant="small" class="color-light donut-tooltip-value">
						{formatCurrency(item.value, currency, { maximumFractionDigits: 0 })}
					</Typography>
				</div>
			</div>
		{/each}
	</div>
</TooltipBase>

<style>
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
	.investment-details {
		display: flex;
		justify-content: space-between;
		gap: var(--half-padding);
	}
	.color-with-name {
		display: flex;
		gap: var(--quarter-padding);
		align-items: center;
	}
	.color-box {
		width: 24px;
		height: 16px;
		border-radius: var(--border-radius);
	}
	.value-with-percentage {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}
	:global(.donut-tooltip-value) {
		opacity: 0.5;
	}
</style>
