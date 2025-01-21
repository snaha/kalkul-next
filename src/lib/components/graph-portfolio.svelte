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

	// Label and gridline frequency
	const GRIDLINE_FREQUENCY = 2
	const LABEL_FREQUENCY = GRIDLINE_FREQUENCY

	interface Props {
		portfolio: Portfolio
		investments: Investment[]
		title?: string
	}

	const { investments, portfolio, title = $_('Portfolio value') }: Props = $props()

	let showDeposits = $state(true)
	let showWithdrawals = $state(true)
	let adjustWithInflation = $state(false)

	const { total, data } = $derived(
		getGraphDataForPortfolio(transactionStore, investments, portfolio),
	)
	const deposits = $derived(
		adjustWithInflation
			? [
					...data.map((r, i) => ({
						data: r.graphInflationDeposits,
						label: r.label,
						fill: 'origin',
						colorIndex: i,
					})),
					{
						data: total.graphDeposits.map((w, i) => w - total.graphInflationDeposits[i]),
						label: '_hidden',
						borderColor: '#303030',
						borderWidth: 1,
						backgroundColor: 'transparent',
					},
				]
			: data.map((r, i) => ({
					data: r.graphDeposits,
					label: r.label,
					fill: 'origin',
					colorIndex: i,
				})),
	)
	const withdrawals = $derived(
		adjustWithInflation
			? [
					...data.map((r, i) => ({
						data: r.graphInflationWithdrawals,
						label: r.label,
						fill: 'origin',
						colorIndex: i,
					})),
					{
						data: total.graphWithdrawals.map((w, i) => w - total.graphInflationWithdrawals[i]),
						label: '_hidden',
						borderColor: '#303030',
						borderWidth: 1,
						backgroundColor: 'transparent',
					},
				]
			: data.map((r, i) => ({
					data: r.graphWithdrawals,
					label: r.label,
					fill: 'origin',
					colorIndex: i,
				})),
	)

	const investmentGraphData = $derived(
		adjustWithInflation
			? [
					...data.map((r, i) => ({
						data: r.graphInflationInvestmentValue,
						label: r.label,
						fill: 'origin',
						colorIndex: i,
						stack: 'g1',
					})),
					{
						data: total.graphInvestmentValue,
						label: '_hidden',
						fill: 'origin',
						stack: 'g2',
						borderColor: '#30303090',
						backgroundColor: 'transparent',
						borderWidth: 1,
					},
				]
			: data.map((r) => ({
					data: r.graphInvestmentValue,
					label: r.label,
					fill: 'origin',
					stack: 'g1',
				})),
	)
</script>

{#if investments.length === 0 || data.length === 0}
	<section class="graph">
		<Typography variant="h1">No data</Typography>
	</section>
{:else}
	<section class="graph">
		<div class="graph-main">
			<Horizontal --horizontal-gap="var(--half-padding)">
				<Typography variant="h5">{title}</Typography>
				<FlexItem />
				<Toggle
					label={$_('Adjust with inflation')}
					dimension="small"
					bind:checked={adjustWithInflation}
				></Toggle>
				<Select dimension="small" variant="solid" label="View" layout="horizontal"></Select>
				<Button dimension="small" variant="ghost"><Maximize size={16} /></Button>
			</Horizontal>
			<Chart
				type="line"
				labels={data[0]?.graphLabels}
				datasets={investmentGraphData}
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
							position: 'bottom',
							labels: {
								filter: (legendItem) => !legendItem.text.endsWith('_hidden'),
								useBorderRadius: true,
								borderRadius: 1,
							},
						},
						tooltip: {
							caretPadding: 20,
							filter: (d) => !d.dataset?.label?.endsWith('_hidden'),
							callbacks: {
								footer: (tooltipItems) => {
									const index = tooltipItems[0].dataIndex
									const val = adjustWithInflation
										? total.graphInflationInvestmentValue
										: total.graphInvestmentValue

									return 'Total: ' + val[index].toLocaleString()
								},
							},
						},
					},
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
				labels={data[0]?.graphLabels}
				datasets={[...(showDeposits ? deposits : []), ...(showWithdrawals ? withdrawals : [])]}
				options={{
					interaction: {
						intersect: false,
						mode: 'index',
					},
					scales: {
						y: {
							stacked: true,
							border: {
								display: false,
							},
						},
						x: {
							stacked: true,
							grid: {
								offset: false,
								color: ({ index }) =>
									index % GRIDLINE_FREQUENCY === 0 ? 'rgba(0,0,0,0.1)' : 'transparent',
							},
							type: 'category',
							ticks: {
								autoSkip: false,
								callback: function (_, index) {
									return index % LABEL_FREQUENCY === 0 ? this.getLabelForValue(index) : ''
								},
							},
						},
					},
					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							caretPadding: 20,
							filter: (d) => !d.dataset?.label?.endsWith('_hidden'),
							callbacks: {
								footer: (tooltipItems) => {
									const index = tooltipItems[0].dataIndex
									const withdrawals = adjustWithInflation
										? total.graphInflationWithdrawals
										: total.graphWithdrawals
									const deposits = adjustWithInflation
										? total.graphInflationDeposits
										: total.graphDeposits

									return `Total: ${(deposits[index] + withdrawals[index]).toLocaleString()}`
								},
							},
						},
					},
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
