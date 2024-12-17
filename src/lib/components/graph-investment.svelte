<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import Chart from '$lib/components/chart.svelte'
	import { getBaseData, getGraphData } from '$lib/calc'
	import type { Investment, Portfolio, Transaction } from '$lib/types'

	interface Props {
		investment: Investment
		portfolio: Portfolio
		investmentData: Transaction[]
	}

	const { investment, portfolio, investmentData }: Props = $props()

	const baseData = $derived(getBaseData(investmentData))
	const graphData = $derived(getGraphData(baseData, investment, portfolio))
</script>

{#if investmentData.length === 0}
	<section class="graph">
		<Typography variant="h1">No data</Typography>
	</section>
{:else}
	<section class="graph">
		<div class="graph-main">
			<Chart
				type="line"
				labels={graphData.graphLabels}
				datasets={[
					{
						label: investment.name,
						fill: 'origin',
						data: graphData.graphInvestmentValue,
					},
				]}
				options={{
					scales: {
						y: {
							min: 0,
						},
					},
				}}
			/>
		</div>
		<div class="graph-main-sub">
			<Chart
				type="bar"
				labels={graphData.graphLabels}
				datasets={[
					{
						fill: 'origin',
						data: graphData.graphDeposits,
						colorIndex: 0,
					},
					{
						fill: 'origin',
						data: graphData.graphWithdrawals,
						colorIndex: 0,
					},
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
