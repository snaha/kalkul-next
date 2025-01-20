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
	}

	Chart.defaults.font.family = getCSSVariableValue('--font-family-sans-serif')
	Chart.defaults.borderColor = getCSSVariableValue('--colors-low')
	Chart.defaults.color = getCSSVariableValue('--colors-high-neutral')

	const DEFAULT_OPTIONS: ChartOptions<ChartType> = {
		maintainAspectRatio: false,
		responsive: false,
	}

	let { labels, datasets, type, options = {}, plugins = [] }: Props = $props()

	let canvas: HTMLCanvasElement | null = $state(null)
	let chart: Chart | null = $state(null)

	function setDatasetColors(datasets: ChartDatasetWithColor[]): ChartDatasetWithColor[] {
		return datasets.map((d, i) => ({
			borderColor: SERIES_COLORS[d.colorIndex ?? i % SERIES_COLORS.length],
			backgroundColor: SERIES_COLORS[d.colorIndex ?? i % SERIES_COLORS.length],
			...d,
		}))
	}

	$effect(() => {
		if (canvas && !chart) {
			chart = new Chart(canvas, {
				type,
				data: {
					labels,
					datasets: setDatasetColors(datasets),
				},
				options: {
					...DEFAULT_OPTIONS,
					...options,
				},
				plugins,
			})
			chart.resize()
		}
		if (chart) {
			chart.data.labels = labels
			chart.data.datasets = setDatasetColors(datasets)
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
