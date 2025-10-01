<script lang="ts">
	import Chart from '$lib/components/chart.svelte'
	import type { TooltipData, CustomDataset } from '$lib/types'
	import TooltipInvestment from './tooltip-investment.svelte'
	import type { GraphPortfolioValue } from '$lib/graph'
	import { locale } from 'svelte-i18n'
	import { getCSSVariableValue } from '$lib/css-vars'

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

	// Store locale for use in callbacks
	const currentLocale = $derived($locale)

	// Calculate the zero-crossing index using the exhaustion date
	const zeroCrossingIndex = $derived(() => {
		const exhaustionDate = graphValuesStore.total.exhaustionDate
		const graphLabels = graphValuesStore.data[0]?.graphLabels

		if (!exhaustionDate || !graphLabels) {
			return undefined
		}

		// Find the index where the exhaustion date falls
		for (let i = 0; i < graphLabels.length; i++) {
			const label = graphLabels[i]

			// Handle monthly format like "2024-8"
			if (label.includes('-')) {
				const [yearStr, monthStr] = label.split('-')
				const year = parseInt(yearStr, 10)
				const month = parseInt(monthStr, 10)

				// Check if exhaustion date falls within this month
				const labelDate = new Date(year, month - 1, 1) // First day of month
				const nextMonth = new Date(year, month, 1) // First day of next month

				if (exhaustionDate >= labelDate && exhaustionDate < nextMonth) {
					return i
				}
			} else {
				// Handle yearly format
				const labelDate = new Date(label)
				if (labelDate.getFullYear() >= exhaustionDate.getFullYear()) {
					return i
				}
			}
		}

		return undefined
	})
</script>

<Chart
	type="line"
	labels={graphValuesStore.data[0]?.graphLabels}
	datasets={adjustWithInflation
		? graphValuesStore.investmentGraphDataWithInflation
		: graphValuesStore.investmentGraphData}
	zeroCrossingIndex={zeroCrossingIndex()}
	options={{
		interaction: {
			intersect: false,
			mode: 'index',
		},
		scales: {
			y: {
				stacked: true,
				min: 0,
				ticks: {
					callback: function (value) {
						if (typeof value === 'number') {
							return new Intl.NumberFormat(currentLocale || undefined).format(value)
						}
						return value
					},
				},
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
					useBorderRadius: true,
					borderRadius: 1,
					generateLabels: (chart) => {
						const datasets = chart.data.datasets
						const defaultColor = getCSSVariableValue('--colors-high-neutral')
						const dangerColor = getCSSVariableValue('--colors-red')

						return datasets
							.map((dataset, i) => {
								const investment = graphValuesStore.data[i]
								const label = dataset.label || ''
								if (label.endsWith('_hidden')) return undefined

								// Only show in red if this specific investment has exhausted (has missing funds)
								const isExhausted =
									investment?.exhaustionDate !== undefined && investment?.missingAmount > 0

								return {
									text: label,
									fillStyle: dataset.backgroundColor as string,
									strokeStyle: dataset.borderColor as string,
									lineWidth: dataset.borderWidth as number,
									hidden: dataset.hidden,
									index: i,
									datasetIndex: i,
									fontColor: isExhausted ? dangerColor : defaultColor,
								}
							})
							.filter((item) => item !== undefined)
					},
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
						// Simplified withdrawal error check using zero-crossing index
						const currentDataIndex = tooltip.dataPoints[0]?.dataIndex
						const hasWithdrawalError =
							currentDataIndex !== undefined &&
							zeroCrossingIndex() !== undefined &&
							currentDataIndex >= zeroCrossingIndex()!

						const filteredDataPoints = tooltip.dataPoints.filter((d) => {
							if (d?.dataset?.label?.startsWith('_hidden')) return false
							return d.raw !== 0 || hasWithdrawalError
						})

						if (filteredDataPoints.length === 0 && hasWithdrawalError) {
							filteredDataPoints.push(
								...tooltip.dataPoints.filter((d) => !d?.dataset?.label?.startsWith('_hidden')),
							)
						}

						investmentsTooltipData = filteredDataPoints.map((d) => {
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
		{
			id: 'withdrawalErrorIndicator',
			afterDraw(chart) {
				const errorIndex = zeroCrossingIndex()
				if (errorIndex === undefined || errorIndex < 0) return

				const ctx = chart.ctx
				const yAxis = chart.scales.y
				const xAxis = chart.scales.x
				const zeroY = yAxis.getPixelForValue(0)
				const startX = xAxis.getPixelForValue(errorIndex)

				ctx.save()

				// Draw red zero line from error point onward
				if (zeroY >= yAxis.top && zeroY <= yAxis.bottom) {
					ctx.beginPath()
					ctx.moveTo(startX, zeroY)
					ctx.lineTo(xAxis.right, zeroY)
					ctx.lineWidth = 4
					ctx.strokeStyle = getCSSVariableValue('--colors-red')
					ctx.stroke()
				}

				// Draw warning icon above zero line (triangle with exclamation mark)
				const iconY = zeroY - 20
				if (iconY >= yAxis.top) {
					const width = 32
					const height = 24
					const radius = 12

					// Draw rounded rectangle background
					ctx.fillStyle = getCSSVariableValue('--colors-red')
					ctx.beginPath()
					ctx.roundRect(startX - width / 2, iconY - height / 2, width, height, radius)
					ctx.fill()

					// Draw filled triangle
					const triangleSize = 14
					const triangleY = iconY - 1
					ctx.fillStyle = 'white'
					ctx.beginPath()
					ctx.moveTo(startX, triangleY - triangleSize / 2)
					ctx.lineTo(startX - triangleSize / 2, triangleY + triangleSize / 2)
					ctx.lineTo(startX + triangleSize / 2, triangleY + triangleSize / 2)
					ctx.closePath()
					ctx.fill()

					// Draw exclamation mark (line)
					ctx.fillStyle = getCSSVariableValue('--colors-red')
					ctx.fillRect(startX - 0.75, triangleY - 3, 1.5, 6)

					// Draw exclamation mark (dot)
					ctx.beginPath()
					ctx.arc(startX, triangleY + 5, 1, 0, Math.PI * 2)
					ctx.fill()
				}

				ctx.restore()
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
	graphLabels={graphValuesStore.data[0]?.graphLabels}
	investmentData={graphValuesStore.data.map((inv, index) => ({
		id: String(graphValuesStore.investments[index]?.id || ''),
		name: inv.label,
		exhaustionDate: inv.exhaustionDate,
		missingAmount: inv.missingAmount,
	}))}
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
