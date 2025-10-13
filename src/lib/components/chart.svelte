<script lang="ts">
	import { SERIES_COLORS } from '$lib/colors'
	import { getCSSVariableValue } from '$lib/css-vars'
	import Chart, {
		type ChartDataset,
		type ChartOptions,
		type ChartType,
		type Plugin,
	} from 'chart.js/auto'

	type ChartDatasetWithColor = ChartDataset & {
		colorIndex?: number
	}

	interface Props {
		labels: (number | string)[]
		datasets: ChartDatasetWithColor[]
		type: ChartType
		options?: ChartOptions<ChartType>
		plugins?: Plugin<ChartType>[]
		zeroCrossingIndex?: number // Optional index where the total value first hits zero
		width?: number // Expose chart width to parent
		disableHover?: boolean // Disable hover effects on points
	}

	Chart.defaults.font.family = getCSSVariableValue('--font-family-sans-serif')
	Chart.defaults.borderColor = getCSSVariableValue('--colors-low')
	Chart.defaults.color = getCSSVariableValue('--colors-high-neutral')

	const DEFAULT_OPTIONS: ChartOptions<ChartType> = {
		maintainAspectRatio: false,
		responsive: true,
	}

	let {
		labels = [],
		datasets = [],
		type,
		options = {},
		plugins = [],
		zeroCrossingIndex,
		width = $bindable(0),
		disableHover = false,
	}: Props = $props()

	let canvas: HTMLCanvasElement | null = $state(null)
	let chart: Chart | null = $state(null)

	function setDatasetColors(datasets: ChartDatasetWithColor[]): ChartDatasetWithColor[] {
		return datasets.map((d, i) => ({
			borderColor: SERIES_COLORS[d.colorIndex ?? i % SERIES_COLORS.length],
			backgroundColor: SERIES_COLORS[d.colorIndex ?? i % SERIES_COLORS.length],
			pointHoverRadius: disableHover ? 0 : 6,
			pointBorderWidth: 2,
			pointHoverBorderWidth: disableHover ? 0 : 1,
			pointHoverBorderColor: Chart.defaults.borderColor,
			...d,
		}))
	}

	function enhanceOptionsWithNegativeValueStyling(
		baseOptions: ChartOptions<ChartType>,
	): ChartOptions<ChartType> {
		if (zeroCrossingIndex === undefined) return baseOptions

		const negativeColor = getCSSVariableValue('--colors-red')
		const defaultColor = getCSSVariableValue('--colors-high-neutral')

		return {
			...baseOptions,
			scales: {
				...baseOptions.scales,
				x: {
					...baseOptions.scales?.x,
					ticks: {
						...baseOptions.scales?.x?.ticks,
						color: function (context: { index: number }) {
							const index = context.index
							// Use zero-crossing index to determine red labels
							if (index >= zeroCrossingIndex) {
								return negativeColor
							}

							return defaultColor
						},
					},
				},
			},
		}
	}

	$effect(() => {
		// Create plain JS copies to avoid Svelte 5 reactivity conflicts with Chart.js
		// Using $state.snapshot() to efficiently break reactivity proxy chain
		const plainDatasets = $state.snapshot(datasets) as typeof datasets

		if (canvas && !chart) {
			chart = new Chart(canvas, {
				type,
				data: {
					labels,
					datasets: setDatasetColors(plainDatasets),
				},
				options: enhanceOptionsWithNegativeValueStyling({
					...DEFAULT_OPTIONS,
					...options,
				}),
				plugins,
			})
			chart.resize()
		} else if (chart) {
			chart.data.labels = labels
			chart.data.datasets = setDatasetColors(plainDatasets)
			// Also update options in case zero-crossing index or withdrawal errors changed
			chart.options = enhanceOptionsWithNegativeValueStyling({
				...DEFAULT_OPTIONS,
				...options,
			})
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
				width = actChartWidth // Expose width to parent
				chart.resize()
			}
		}, 100)
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
		flex: 1;
		min-height: 120px;
	}
</style>
