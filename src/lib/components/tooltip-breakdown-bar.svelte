<script lang="ts">
	import { SERIES_COLORS } from '$lib/colors'
	import { formatCurrency } from '$lib/utils'
	import type { TooltipGraphProps } from './tooltip-base.svelte'
	import TooltipBase from './tooltip-base.svelte'
	import Typography from './ui/typography.svelte'
	import { _, locale } from 'svelte-i18n'
	interface Props extends TooltipGraphProps {
		adjustWithInflation: boolean
		currency: string
		totalValue: number[]
		totalValueWithInflation: number[]
		dataLabels: string[]
		totalLabels: string[]
	}
	const {
		tooltipData,
		adjustWithInflation,
		currency,
		totalValue,
		totalValueWithInflation,
		dataLabels,
		totalLabels,
		...restProps
	}: Props = $props()
</script>

<TooltipBase {tooltipData} {adjustWithInflation} {...restProps}>
	{#if tooltipData.length > 0}
		<Typography variant="h6" class="color-light">{dataLabels[tooltipData[0].dataIndex]}</Typography>
		<div class="col">
			{#each tooltipData as data}
				<div class="investment-details">
					<div class="color-with-name">
						<div
							class="color-box"
							style={`background-color: ${SERIES_COLORS[data.colorIndex]}`}
						></div>
						<Typography variant="small" class="color-light">{data.name}</Typography>
					</div>
					<Typography variant="small" class="color-light"
						>+{formatCurrency(data.value, currency, $locale, {
							maximumFractionDigits: 0,
						})}</Typography
					>
				</div>
			{/each}
		</div>
		{#if adjustWithInflation}
			<div class="col">
				<div class="total">
					<Typography class="color-light" variant="h6">
						{totalLabels[tooltipData[0].dataIndex]}
					</Typography>
					<Typography variant="h6" class="color-light"
						>{formatCurrency(totalValueWithInflation[tooltipData[0].dataIndex], currency, $locale, {
							maximumFractionDigits: 0,
						})}</Typography
					>
				</div>
				<div class="total opacity">
					<Typography class="color-light" variant="small">{$_('common.nominal')}</Typography>
					<Typography variant="small" class="color-light"
						>{formatCurrency(totalValue[tooltipData[0].dataIndex], currency, $locale, {
							maximumFractionDigits: 0,
						})}</Typography
					>
				</div>
			</div>
		{:else}
			<div class="total">
				<Typography class="color-light" variant="h6">
					{totalLabels[tooltipData[0].dataIndex]}
				</Typography>
				<Typography variant="h6" class="color-light"
					>{formatCurrency(totalValue[tooltipData[0].dataIndex], currency, $locale, {
						maximumFractionDigits: 0,
					})}</Typography
				>
			</div>
		{/if}
	{/if}
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
	}
	.color-box {
		width: 24px;
		height: 16px;
		border-radius: var(--border-radius);
	}
	.total {
		display: flex;
		justify-content: space-between;
		gap: var(--half-padding);
	}
	.opacity {
		opacity: 50%;
	}
</style>
