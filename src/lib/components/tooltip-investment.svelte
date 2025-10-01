<script lang="ts">
	import { SERIES_COLORS } from '$lib/colors'
	import { formatCurrency } from '$lib/utils'
	import type { TooltipGraphProps } from './tooltip-base.svelte'
	import TooltipBase from './tooltip-base.svelte'
	import Typography from './ui/typography.svelte'
	import { _, locale } from 'svelte-i18n'
	import { WarningAltFilled } from 'carbon-icons-svelte'
	interface Props extends TooltipGraphProps {
		currency: string
		totalValue: number[]
		totalWithInflation: number[]
		investmentData?: Array<{
			id: string
			name: string
			exhaustionDate?: Date
			missingAmount: number
		}>
		graphLabels?: (string | number)[]
	}
	const {
		tooltipData,
		currency,
		totalValue,
		totalWithInflation,
		adjustWithInflation,
		investmentData = [],
		graphLabels = [],
		...restProps
	}: Props = $props()

	// Check if a specific investment is exhausted at the current data point
	function getInvestmentExhaustionInfo(investmentName: string, dataIndex: number) {
		const investment = investmentData.find((inv) => inv.name === investmentName)
		if (!investment?.exhaustionDate || !graphLabels[dataIndex]) {
			return {
				isExhausted: false,
				missingAmount: 0,
			}
		}

		// Parse the label to get the date
		const label = String(graphLabels[dataIndex])
		let labelDate: Date

		if (label.includes('-')) {
			// Handle monthly format like "2024-8"
			const [yearStr, monthStr] = label.split('-')
			const year = parseInt(yearStr, 10)
			const month = parseInt(monthStr, 10)
			labelDate = new Date(year, month - 1, 1)
		} else {
			// Handle yearly format
			labelDate = new Date(parseInt(label, 10), 0, 1)
		}

		// Check if the current data point is at or after the exhaustion date
		const isExhausted = labelDate >= investment.exhaustionDate

		return {
			isExhausted,
			missingAmount: investment?.missingAmount || 0,
		}
	}
</script>

<TooltipBase {tooltipData} {adjustWithInflation} {...restProps}>
	<div class="col">
		{#each tooltipData as investment}
			{@const exhaustionInfo = getInvestmentExhaustionInfo(investment.name, investment.dataIndex)}
			<div class="investment-details">
				{#if exhaustionInfo.isExhausted}
					<div class="color-with-name">
						<div
							class="color-box"
							style={`background-color: ${SERIES_COLORS[investment.colorIndex]}`}
						></div>
						<Typography variant="small" class="missing-value-text">{investment.name}</Typography>
					</div>
					<div class="missing-funds-text">
						<div class="investment-warning-icon">
							<WarningAltFilled size={16} />
						</div>
						<Typography variant="small" class="missing-value-text">
							{$_('component.tooltipTransaction.missingFunds')}
						</Typography>
					</div>
				{:else}
					<div class="color-with-name">
						<div
							class="color-box"
							style={`background-color: ${SERIES_COLORS[investment.colorIndex]}`}
						></div>
						<Typography variant="small" class="color-light">{investment.name}</Typography>
					</div>
					<Typography variant="small" class="color-light"
						>{formatCurrency(investment.value, currency, $locale, {
							maximumFractionDigits: 0,
						})}</Typography
					>
				{/if}
			</div>
		{/each}
	</div>
	{#if adjustWithInflation}
		<div class="col">
			<div class="total">
				<Typography class="color-light" variant="h6">{$_('common.total')}</Typography>
				<Typography variant="h6" class="color-light"
					>{formatCurrency(totalWithInflation[tooltipData[0].dataIndex], currency, $locale, {
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
			<Typography class="color-light" variant="h6">{$_('common.total')}</Typography>
			<Typography variant="h6" class="color-light"
				>{formatCurrency(totalValue[tooltipData[0].dataIndex], currency, $locale, {
					maximumFractionDigits: 0,
				})}</Typography
			>
		</div>
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
		align-items: center;
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
	.investment-warning-icon {
		color: var(--colors-red);
		display: flex;
		align-items: center;
	}
	.missing-funds-text {
		display: flex;
		align-items: center;
		gap: var(--quarter-padding);
	}
	:global(.missing-value-text) {
		color: var(--colors-red) !important;
		font-weight: 500;
	}
</style>
