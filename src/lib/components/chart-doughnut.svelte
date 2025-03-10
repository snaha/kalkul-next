<script lang="ts">
	import { SERIES_COLORS } from '$lib/colors'
	import { getCSSVariableValue } from '$lib/css-vars'
	import type { InvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import type { InvestmentWithColorIndex } from '$lib/types'
	import Chart, { type ChartDataset, type ChartOptions } from 'chart.js/auto'

	interface Props {
		data: number[]
		labels: string[]
		investments: InvestmentWithColorIndex[]
		investmentsViewStore: InvestmentsViewStore
	}

	Chart.defaults.font.family = getCSSVariableValue('--font-family-sans-serif')
	Chart.defaults.borderColor = getCSSVariableValue('--colors-low')
	Chart.defaults.color = getCSSVariableValue('--colors-high-neutral')

	const DEFAULT_OPTIONS: ChartOptions<'doughnut'> = {
		maintainAspectRatio: false,
		responsive: false,
	}

	let { data, labels, investments, investmentsViewStore }: Props = $props()

	let canvas: HTMLCanvasElement | null = $state(null)
	let chart: Chart | null = $state(null)

	const isEmpty = $derived(data.every((d) => d === 0))

	function setDataset(): ChartDataset<'doughnut'> {
		const visibleData = data.filter((_, i) => !investmentsViewStore.isHidden(investments[i].id))

		const visibleColors = data.reduce<string[]>((acc, _, i) => {
			if (!investmentsViewStore.isHidden(investments[i].id)) {
				const colorIndex = investments[i].colorIndex ?? i % SERIES_COLORS.length
				acc.push(SERIES_COLORS[colorIndex])
			}
			return acc
		}, [])
		if (isEmpty) {
			return {
				data: [1],
				backgroundColor: 'grey',
				hoverBackgroundColor: 'grey',
				borderWidth: 0,
			}
		} else {
			return {
				data: visibleData,
				backgroundColor: visibleColors,
				hoverBorderWidth: 1,
				hoverBorderColor: Chart.defaults.borderColor,
			}
		}
	}

	$effect(() => {
		if (canvas && !chart) {
			chart = new Chart(canvas, {
				type: 'doughnut',
				data: {
					labels: labels,
					datasets: [setDataset()],
				},
				options: {
					...DEFAULT_OPTIONS,
					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							enabled: !isEmpty,
						},
					},
					animation: false,
				},
			})
			chart.resize()
		}
		if (chart) {
			chart.data.labels = labels
			chart.data.datasets = [setDataset()]
			if (chart.options.plugins && chart.options.plugins.tooltip) {
				chart.options.plugins.tooltip.enabled = !isEmpty
			}

			chart.update()
		}
	})
	let prevChartWidth: number = $state(0)
	let actChartWidth: number = $state(0)
	let actChartHeight: number = $state(0)
	let prevChartHeight: number = $state(0)
	$effect(() => {
		const interval = setInterval(() => {
			if ((actChartWidth !== prevChartWidth || actChartHeight !== prevChartHeight) && chart) {
				prevChartHeight = actChartHeight
				prevChartWidth = actChartWidth
				chart.resize()
			}
		}, 500)
		return () => {
			clearInterval(interval)
		}
	})
</script>

<div class="chart" bind:clientWidth={actChartWidth} bind:clientHeight={actChartHeight}>
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart {
		width: 100%;
		height: 100%;
	}
</style>
