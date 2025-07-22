<script lang="ts">
	import Chart from '$lib/components/chart.svelte'
	import type { TooltipData, CustomDataset } from '$lib/types'
	import TooltipInvestment from './tooltip-investment.svelte'
	import type { GraphPortfolioValue } from '$lib/graph'

	// Label and gridline frequency
	const GRIDLINE_FREQUENCY = 2
	const LABEL_FREQUENCY = GRIDLINE_FREQUENCY

	interface Props {
		graphValueData: GraphPortfolioValue
		adjustWithInflation: boolean
		clientBirthDate?: Date
	}

	let { graphValueData: graphValuesStore, adjustWithInflation, clientBirthDate }: Props = $props()

	let investmentsTooltipData: TooltipData[] = $state([])
	let tooltipPosition = $state({ x: 0, y: 0 })
</script>

<Chart
	type="line"
	labels={graphValuesStore.data[0]?.graphLabels}
	datasets={adjustWithInflation
		? graphValuesStore.investmentGraphDataWithInflation
		: graphValuesStore.investmentGraphData}
	options={{
		interaction: {
			intersect: false,
			mode: 'index',
		},
		scales: {
			y: {
				stacked: true,
				min: 0,
			},
			x: {
				grid: {
					offset: false,
					color: ({ index }) =>
						index % GRIDLINE_FREQUENCY === 0 ? 'rgba(0,0,0,0.1)' : 'transparent',
				},
				ticks: {
					autoSkip: false,
					callback: function (_, index) {
						return index % LABEL_FREQUENCY === 0 ? this.getLabelForValue(index) : ''
					},
				},
			},
		},
		elements: {
			point: {
				radius: 0,
			},
		},
		plugins: {
			legend: {
				onClick: (e, item) => {
					const index = item.datasetIndex
					if (index !== undefined)
						graphValuesStore.investmentsViewStore.toggleHide(graphValuesStore.investments[index].id)
				},
				position: 'bottom',
				labels: {
					filter: (legendItem) => !legendItem.text.endsWith('_hidden'),
					useBorderRadius: true,
					borderRadius: 1,
				},
			},
			tooltip: {
				enabled: false,
				external: (context) => {
					const { tooltip } = context

					if (tooltip.opacity === 0) {
						investmentsTooltipData = []
					} else {
						tooltipPosition = {
							x: tooltip.caretX,
							y: tooltip.caretY,
						}
						investmentsTooltipData = tooltip.dataPoints
							.filter((d) => d.raw !== 0 && !d?.dataset?.label?.startsWith('_hidden'))
							.map((d) => {
								const dataset = d.dataset as CustomDataset<'line'>
								return {
									dataIndex: d.dataIndex,
									value: d.raw as number,
									colorIndex: dataset.colorIndex,
									name: dataset.label,
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
<TooltipInvestment
	{tooltipPosition}
	tooltipData={investmentsTooltipData}
	totalValue={graphValuesStore.totalValue}
	totalWithInflation={graphValuesStore.totalWithInflation}
	{adjustWithInflation}
	currency={graphValuesStore.portfolio.currency}
	year={(() => {
		if (investmentsTooltipData.length === 0 || !graphValuesStore.data[0]?.graphLabels)
			return new Date().getFullYear()
		const label = graphValuesStore.data[0].graphLabels[investmentsTooltipData[0].dataIndex]
		if (label?.includes('-')) {
			return parseInt(label.split('-')[0], 10)
		} else {
			return parseInt(label, 10)
		}
	})()}
	{clientBirthDate}
/>
