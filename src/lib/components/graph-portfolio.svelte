<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import Chart from '$lib/components/chart.svelte'
	import { getGraphDataForPortfolio } from '$lib/calc'
	import type { Portfolio, Investment } from '$lib/types'
	import { transactionStore } from '$lib/stores/transaction.svelte'

	interface Props {
		portfolio: Portfolio
		investments: Investment[]
	}

	const { investments, portfolio }: Props = $props()

	const graphData = $derived(getGraphDataForPortfolio(transactionStore, investments, portfolio))
</script>

{#if investments.length === 0 || graphData.length === 0}
	<section class="graph">
		<Typography variant="h1">No data</Typography>
	</section>
{:else}
	<section class="graph">
		<div class="graph-main">
			<Chart
				type="line"
				labels={graphData[0]?.graphLabels}
				datasets={graphData.map((r) => ({
					data: r.graphInvestmentValue,
					label: r.label,
					fill: 'origin',
				}))}
				options={{
					scales: {
						y: {
							stacked: true,
							min: 0,
						},
					},
				}}
			/>
		</div>
		<div class="graph-main-sub">
			<Chart
				type="bar"
				labels={graphData[0]?.graphLabels}
				datasets={[
					...graphData.map((r, i) => ({
						data: r.graphDeposits,
						label: r.label,
						fill: 'origin',
						colorIndex: i,
					})),
					...graphData.map((r, i) => ({
						data: r.graphWithdrawals,
						label: r.label,
						fill: 'origin',
						colorIndex: i,
					})),
				]}
				options={{
					scales: {
						y: {
							stacked: true,
						},
						x: {
							stacked: true,
						},
					},
					plugins: {
						legend: {
							display: false,
						},
					},
				}}
			/>
		</div>
	</section>
{/if}

<style>
	.graph {
		display: flex;
		flex-direction: column;
		padding: 16px;
		min-height: 100%;
		width: 100%;

		.graph-main {
			width: 100%;
			aspect-ratio: 1087 / 362; /* Maintain the 1087:362 ratio */
			background-color: var(--colors-base);
			display: flex;
			flex-direction: column;
			margin-top: var(--padding);
			padding: var(--half-padding);
		}

		.graph-main-sub {
			width: 100%;
			aspect-ratio: 1087 / 120; /* Maintain the 1087:120 ratio */
			background-color: var(--colors-base);
			display: flex;
			flex-direction: column;
			margin-top: var(--half-padding);
			padding: var(--half-padding);
		}
	}
</style>
