<script lang="ts">
	import Chart, { type ChartDataset } from 'chart.js/auto'

	interface Props {
		labels: (number | string)[]
		series: ChartDataset[]
	}
	let { labels, series }: Props = $props()

	let canvas: HTMLCanvasElement | null = $state(null)
	let chart: Chart | null = $state(null)

	$effect(() => {
		if (canvas && !chart) {
			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels: labels,
					datasets: series,
				},

				options: {
					scales: {
						y: {
							min: 0,
						},
					},
					responsive: false,
				},
			})
			chart.resize()
		}
		if (chart) {
			chart.data.labels = labels
			chart.data.datasets = series
			chart.update()
		}
	})
	let prevChartWidth: number = $state(0)
	let actChartWidth: number = $state(0)
	$effect(() => {
		const interval = setInterval(() => {
			if (actChartWidth !== prevChartWidth && chart) {
				prevChartWidth = actChartWidth
				chart.resize()
			}
		}, 1000)
		return () => {
			clearInterval(interval)
		}
	})
</script>

<div class="chart" bind:clientWidth={actChartWidth}>
	<canvas bind:this={canvas}></canvas>
</div>
