<script lang="ts">
	import Chart from '$lib/components/chart.svelte'
	import type { Portfolio, TooltipData, CustomDataset } from '$lib/types'
	import TooltipTransaction from './tooltip-transaction.svelte'
	import type { GraphPortfolioTransactions } from '$lib/graph'

	// Label and gridline frequency
	const GRIDLINE_FREQUENCY = 2
	const LABEL_FREQUENCY = GRIDLINE_FREQUENCY

	interface Props {
		graphTransactionsData: GraphPortfolioTransactions
		portfolio: Portfolio
		adjustWithInflation: boolean
		showDeposits: boolean
		showWithdrawals: boolean
		showFees: boolean
	}

	let {
		graphTransactionsData,
		portfolio,
		adjustWithInflation,
		showDeposits,
		showWithdrawals,
		showFees,
	}: Props = $props()

	let transactionTooltipData: TooltipData[] = $state([])

	let tooltipPosition = $state({ x: 0, y: 0 })
</script>

<Chart
	type="bar"
	labels={graphTransactionsData.data[0]?.graphLabels}
	datasets={[
		...(showWithdrawals
			? adjustWithInflation
				? graphTransactionsData.withdrawalsWithInflation
				: graphTransactionsData.withdrawals
			: []),
		...(showDeposits
			? adjustWithInflation
				? graphTransactionsData.depositsWithInflation
				: graphTransactionsData.deposits
			: []),
		...(showFees
			? adjustWithInflation
				? graphTransactionsData.feesWithInflation
				: graphTransactionsData.fees
			: []),
	]}
	options={{
		interaction: {
			intersect: false,
			mode: 'index',
		},
		scales: {
			y: {
				stacked: true,
				border: {
					display: false,
				},
			},
			x: {
				stacked: true,
				grid: {
					offset: false,
					color: ({ index }) =>
						index % GRIDLINE_FREQUENCY === 0 ? 'rgba(0,0,0,0.1)' : 'transparent',
				},
				type: 'category',
				ticks: {
					autoSkip: false,
					callback: function (_, index) {
						return index % LABEL_FREQUENCY === 0 ? this.getLabelForValue(index) : ''
					},
				},
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: false,
				external: (context) => {
					const { tooltip } = context

					if (tooltip.opacity === 0) {
						transactionTooltipData = []
					} else {
						tooltipPosition = {
							x: tooltip.caretX,
							y: tooltip.caretY,
						}

						transactionTooltipData = tooltip.dataPoints
							.filter((d) => d.raw !== 0)
							.map((d) => {
								const dataset = d.dataset as CustomDataset<'bar'>
								return {
									dataIndex: d.dataIndex,
									value: d.raw as number,
									colorIndex: dataset.colorIndex,
									name: dataset.label,
									type: dataset.colorIndex !== undefined ? 'transaction' : 'fee',
								}
							})
					}
					const graphWidth = context.chart.width
					const tooltipWidth = 321

					tooltipPosition.y += 32

					if (tooltipPosition.x < graphWidth / 2) {
						tooltipPosition.x += tooltipWidth + 16
					} else {
						tooltipPosition.x -= 16
					}
				},
			},
		},
		animation: false,
	}}
	plugins={[
		{
			id: 'verticalLine',
			afterDraw(chart) {
				if (chart?.tooltip && chart.tooltip.opacity > 0) {
					const ctx = chart.ctx
					const x = chart.tooltip.caretX
					const yAxis = chart.scales.y

					ctx.save()
					ctx.beginPath()
					ctx.moveTo(x, yAxis.top)
					ctx.lineTo(x, yAxis.bottom)
					ctx.lineWidth = 1
					ctx.strokeStyle = 'gray'
					ctx.stroke()
					ctx.restore()
				}
			},
		},
	]}
/>
<TooltipTransaction
	{tooltipPosition}
	tooltipData={transactionTooltipData}
	totalDeposits={graphTransactionsData.totalDeposits}
	totalDepositsWithInflation={graphTransactionsData.totalDepositsWithInflation}
	totalWithdrawals={graphTransactionsData.totalWithdrawals}
	totalWithdrawalsWithInflation={graphTransactionsData.totalWithdrawalsWithInflation}
	totalFees={graphTransactionsData.totalFees}
	totalFeesWithInflation={graphTransactionsData.totalFeesWithInflation}
	{adjustWithInflation}
	{showFees}
	currency={portfolio.currency}
	labels={graphTransactionsData.data[0]?.graphLabels}
/>
