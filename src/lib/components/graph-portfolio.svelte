<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import Chart from '$lib/components/chart.svelte'
	import { getGraphDataForPortfolio } from '$lib/calc'
	import type { Portfolio, Investment } from '$lib/types'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import Toggle from './ui/toggle.svelte'
	import { _ } from 'svelte-i18n'
	import Select from './ui/select/select.svelte'
	import Button from './ui/button.svelte'
	import { Maximize } from 'carbon-icons-svelte'
	import Checkbox from './ui/checkbox.svelte'

	interface Props {
		portfolio: Portfolio
		investments: Investment[]
		title?: string
	}

	const { investments, portfolio, title = $_('Portfolio value') }: Props = $props()

	let showDeposits = $state(true)
	let showWithdrawals = $state(true)

	const graphData = $derived(getGraphDataForPortfolio(transactionStore, investments, portfolio))
	const deposits = $derived(
		graphData.map((r, i) => ({
			data: r.graphDeposits,
			label: r.label,
			fill: 'origin',
			colorIndex: i,
		})),
	)
	const withdrawals = $derived(
		graphData.map((r, i) => ({
			data: r.graphWithdrawals,
			label: r.label,
			fill: 'origin',
			colorIndex: i,
		})),
	)
</script>

{#if investments.length === 0 || graphData.length === 0}
	<section class="graph">
		<Typography variant="h1">No data</Typography>
	</section>
{:else}
	<section class="graph">
		<div class="graph-main">
			<Horizontal --horizontal-gap="var(--half-padding)">
				<Typography variant="h5">{title}</Typography>
				<FlexItem />
				<Toggle label={$_('Adjust with inflation')} dimension="small"></Toggle>
				<Select dimension="small" variant="solid" label="View" layout="horizontal"></Select>
				<Button dimension="small" variant="ghost"><Maximize size={16} /></Button>
			</Horizontal>
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
					plugins: {
						legend: {
							position: 'bottom',
							labels: {
								useBorderRadius: true,
								borderRadius: 1,
							},
						},
					},
				}}
			/>
		</div>
		<div class="graph-main-sub">
			<Horizontal --horizontal-gap="var(--half-padding)">
				<Typography variant="h5">{$_('Deposits & withdrawals')}</Typography>
				<FlexItem />
				<Checkbox dimension="small" label={$_('Deposits')} bind:checked={showDeposits}></Checkbox>
				<Checkbox dimension="small" label={$_('Withdrawals')} bind:checked={showWithdrawals}
				></Checkbox>
				<Button dimension="small" variant="ghost"><Maximize size={16} /></Button>
			</Horizontal>
			<Chart
				type="bar"
				labels={graphData[0]?.graphLabels}
				datasets={[...(showDeposits ? deposits : []), ...(showWithdrawals ? withdrawals : [])]}
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
		min-height: 100%;
		width: 100%;
		gap: var(--padding);

		.graph-main {
			width: 100%;
			aspect-ratio: 1000 / 350;
			background-color: var(--colors-base);
			display: flex;
			flex-direction: column;
			padding: var(--padding);
			border-radius: var(--border-radius);
			border: 1px solid var(--colors-low);
			gap: var(--half-padding);
		}

		.graph-main-sub {
			width: 100%;
			aspect-ratio: 1000 / 250;
			background-color: var(--colors-base);
			display: flex;
			flex-direction: column;
			padding: var(--padding);
			border-radius: var(--border-radius);
			border: 1px solid var(--colors-low);
			gap: var(--half-padding);
		}
	}
</style>
