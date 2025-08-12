<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import Chart from '$lib/components/chart.svelte'
	import type { InvestmentWithColorIndex, Portfolio, TooltipData, CustomDataset } from '$lib/types'
	import type { GraphData } from '$lib/@snaha/kalkul-maths'
	import Horizontal from './ui/horizontal.svelte'
	import type { InvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import Slider from './ui/slider.svelte'
	import ChartDoughnut from './chart-doughnut.svelte'
	import TooltipBreakdownBar from './tooltip-breakdown-bar.svelte'
	import { _, locale } from 'svelte-i18n'

	interface Props {
		portfolio: Portfolio
		investments: InvestmentWithColorIndex[]
		adjustWithInflation: boolean
		investmentsViewStore: InvestmentsViewStore
		selectedIndex: number
		data: GraphData[]
		total: GraphData
		lowColor: string
		baseColor: string
		clientBirthDate?: Date
	}

	let {
		portfolio,
		investments,
		adjustWithInflation,
		investmentsViewStore,
		selectedIndex = $bindable(0),
		data,
		total,
		lowColor,
		baseColor,
		clientBirthDate,
	}: Props = $props()

	const breakdownChartData = $derived(
		data.map((r, i) => ({
			data: [
				r.graphInvestmentValues[selectedIndex],
				r.graphDeposits[selectedIndex],
				-r.graphWithdrawals[selectedIndex],
				-r.graphFeeValues[selectedIndex],
			],
			label: r.label,
			colorIndex: investments[i].colorIndex ?? i,
			fill: 'origin',
			hidden: investmentsViewStore.isHidden(investments[i].id),
		})),
	)

	const breakdownInflationChartData = $derived([
		...data.map((r, i) => ({
			data: [
				r.graphInflationInvestmentValues[selectedIndex],
				r.graphInflationDeposits[selectedIndex],
				-r.graphInflationWithdrawals[selectedIndex],
				-r.graphInflationFeeValues[selectedIndex],
			],
			label: r.label,
			colorIndex: investments[i].colorIndex ?? i,
			fill: 'origin',
			hidden: investmentsViewStore.isHidden(investments[i].id),
		})),
		{
			data: [
				total.graphInvestmentValues[selectedIndex] -
					total.graphInflationInvestmentValues[selectedIndex],
				total.graphDeposits[selectedIndex] - total.graphInflationDeposits[selectedIndex],
				-total.graphWithdrawals[selectedIndex] - total.graphInflationWithdrawals[selectedIndex],
				-total.graphFeeValues[selectedIndex] - total.graphInflationFeeValues[selectedIndex],
			],
			label: '_hidden',
			borderColor: lowColor,
			borderWidth: 1,
			backgroundColor: baseColor,
		},
	])

	const totalValue = $derived([
		data.reduce((acc, r) => acc + r.graphInvestmentValues[selectedIndex], 0),
		data.reduce((acc, r) => acc + r.graphDeposits[selectedIndex], 0),
		data.reduce((acc, r) => acc + -r.graphWithdrawals[selectedIndex], 0),
		data.reduce((acc, r) => acc + -r.graphFeeValues[selectedIndex], 0),
	])
	const totalValueWithInflation = $derived([
		data.reduce((acc, r) => acc + r.graphInflationInvestmentValues[selectedIndex], 0),
		data.reduce((acc, r) => acc + r.graphInflationDeposits[selectedIndex], 0),
		data.reduce((acc, r) => acc + -r.graphInflationWithdrawals[selectedIndex], 0),
		data.reduce((acc, r) => acc + -r.graphInflationFeeValues[selectedIndex], 0),
	])

	function getDateFromGraphLabels(graphLabels: string) {
		const month = graphLabels.includes('-') ? graphLabels : undefined
		if (month) {
			const [year, monthNum] = month.split('-').map(Number)
			return new Date(year, monthNum - 1).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
			})
		} else {
			return graphLabels
		}
	}
	let tooltipPosition = $state({ x: 0, y: 0 })
	let tooltipData: TooltipData[] = $state([])
	let dataLabels = [
		$_('common.investmentValue'),
		$_('common.deposited'),
		$_('common.withdrawn'),
		$_('common.fees'),
	]
	let totalLabels = [
		$_('common.totalInvestments'),
		$_('common.totalDeposited'),
		$_('common.totalWithdrawn'),
		$_('common.totalFees'),
	]
	let cursorX = $state(0)
</script>

<Horizontal>
	<div class="doughnut">
		<ChartDoughnut
			data={(() => {
				const investmentValues = data.map((d) =>
					adjustWithInflation
						? d.graphInflationInvestmentValues[selectedIndex] +
							d.graphInflationDeposits[selectedIndex] -
							d.graphInflationWithdrawals[selectedIndex] -
							d.graphInflationFeeValues[selectedIndex]
						: d.graphInvestmentValues[selectedIndex] +
							d.graphDeposits[selectedIndex] -
							d.graphWithdrawals[selectedIndex] -
							d.graphFeeValues[selectedIndex],
				)
				return investmentValues
			})()}
			labels={data.map((d) => d.label)}
			{investments}
			{investmentsViewStore}
			currency={portfolio.currency}
			currentYear={getDateFromGraphLabels(data[0].graphLabels[selectedIndex])}
			{clientBirthDate}
			{adjustWithInflation}
		/>
	</div>
	<div class="breakdown">
		<Chart
			type="bar"
			labels={dataLabels}
			datasets={adjustWithInflation ? breakdownInflationChartData : breakdownChartData}
			options={{
				interaction: {
					intersect: false,
					mode: 'nearest',
					axis: 'y',
				},
				elements: {
					point: {
						radius: 0,
					},
				},
				scales: {
					y: {
						stacked: true,
						border: {
							display: false,
						},
						min: 0,
						type: 'category',
					},
					x: {
						stacked: true,
						min: 0,
						ticks: {
							callback: function (value) {
								if (typeof value === 'number') {
									return new Intl.NumberFormat($locale || undefined).format(value)
								}
								return value
							},
						},
					},
				},
				indexAxis: 'y',
				animation: false,
				plugins: {
					legend: {
						display: false,
					},
					title: {
						display: false,
					},
					tooltip: {
						enabled: false,
						external: (context) => {
							const { tooltip } = context

							if (tooltip.opacity === 0) {
								tooltipData = []
							} else {
								tooltipPosition = {
									x: cursorX,
									y: tooltip.caretY,
								}
								tooltipData = tooltip.dataPoints
									.filter((d) => d.raw !== 0 && !d?.dataset?.label?.startsWith('_hidden'))
									.map((d) => {
										const dataset = d.dataset as CustomDataset<'bar'>
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
								tooltipPosition.x += tooltipWidth + 16 + tooltipWidth / 2
							} else {
								tooltipPosition.x += tooltipWidth / 2 - 48
							}
						},
					},
				},
			}}
			plugins={[
				{
					id: 'cursorPosition',
					beforeEvent(chart, args) {
						const event = args.event

						if (event && event.type === 'mousemove') {
							cursorX = event.x ?? 0

							// ✅ Manually trigger external tooltip logic
							const tooltip = chart.tooltip
							const external = chart.options.plugins?.tooltip?.external
							if (external && tooltip && typeof external === 'function') {
								external.call(tooltip, { chart, tooltip })
							}
						}
					},
				},

				{
					id: 'horizontalLine',
					afterDraw(chart) {
						const tooltip = chart.tooltip
						if (tooltip && tooltip.opacity > 0) {
							const ctx = chart.ctx
							const y = tooltip.caretY
							const xAxis = chart.scales.x

							ctx.save()
							ctx.beginPath()
							ctx.moveTo(xAxis.left, y)
							ctx.lineTo(xAxis.right, y)
							ctx.lineWidth = 1
							ctx.strokeStyle = 'gray'
							ctx.stroke()
							ctx.restore()
						}
					},
				},
			]}
		/>
	</div>
</Horizontal>
<div class="slider">
	<Slider
		withoutShowValue
		dimension="compact"
		alwaysShowValue
		min={0}
		max={data[0]?.graphLabels.length - 1}
		bind:value={selectedIndex}
	></Slider>
	<div class="date">
		<Typography variant="small" font="mono"
			>{getDateFromGraphLabels(data[0].graphLabels[selectedIndex])}</Typography
		>
	</div>
</div>
<TooltipBreakdownBar
	{dataLabels}
	{totalLabels}
	{tooltipData}
	{tooltipPosition}
	{adjustWithInflation}
	currency={portfolio.currency}
	{totalValue}
	{totalValueWithInflation}
	year={(() => {
		const label = data[0].graphLabels[selectedIndex]
		if (label.includes('-')) {
			// Format: "2024-1" -> extract year
			return parseInt(label.split('-')[0], 10)
		} else {
			// Format: "2024" -> direct year
			return parseInt(label, 10)
		}
	})()}
	{clientBirthDate}
/>

<style>
	:root {
		--doughnut-size: 120px;
	}
	.date {
		display: flex;
		justify-content: end;
		align-items: center;
		width: 30px;
	}
	.doughnut {
		width: var(--doughnut-size);
		height: var(--doughnut-size);
	}
	.breakdown {
		width: calc(100% - var(--doughnut-size) - var(--padding));
		display: flex;
		flex-direction: column;
	}
	.slider {
		display: flex;
		align-items: center right;
	}
</style>
