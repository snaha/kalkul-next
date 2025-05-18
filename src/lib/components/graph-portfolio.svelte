<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import Chart from '$lib/components/chart.svelte'
	import type { Portfolio, InvestmentWithColorIndex, TooltipData, CustomDataset } from '$lib/types'
	import { getGraphDataForPortfolio } from '$lib/@snaha/kalkul-maths'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import { _ } from 'svelte-i18n'
	import Button from './ui/button.svelte'
	import { ArrowRight, Maximize } from 'carbon-icons-svelte'
	import Checkbox from './ui/checkbox.svelte'
	import type { InvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import Slider from './ui/slider.svelte'
	import ChartDoughnut from './chart-doughnut.svelte'
	import Toggle from './ui/toggle.svelte'
	import Badge from './ui/badge.svelte'
	import FullscreenGraph from './graph-fullscreen.svelte'
	import type { Snippet } from 'svelte'
	import TooltipInvestment from './tooltip-investment.svelte'
	import TooltipTransaction from './tooltip-transaction.svelte'
	import { getCSSVariableValue } from '$lib/css-vars'

	// Label and gridline frequency
	const GRIDLINE_FREQUENCY = 2
	const LABEL_FREQUENCY = GRIDLINE_FREQUENCY

	interface Props {
		portfolio: Portfolio
		investments: InvestmentWithColorIndex[]
		adjustWithInflation: boolean
		title?: string
		investmentsViewStore: InvestmentsViewStore
		fullscreen: () => void
		isGraphFullscreened: boolean
		isSidebarOpen: boolean
		view?: boolean
		sidebarButton?: Snippet
	}

	let {
		investments,
		portfolio,
		title = $_('common.value'),
		adjustWithInflation = $bindable(),
		investmentsViewStore,
		fullscreen,
		isGraphFullscreened,
		isSidebarOpen,
		view = false,
		sidebarButton,
	}: Props = $props()
	let showDeposits = $state(true)
	let showWithdrawals = $state(true)
	let showFees = $state(true)
	let selectedIndex = $state(0)
	const { total, data } = $derived(
		getGraphDataForPortfolio(transactionStore, investments, portfolio),
	)
	const lowColor = getCSSVariableValue('--colors-low')
	const deposits = $derived(
		adjustWithInflation
			? [
					...data.map((r, i) => ({
						data: r.graphInflationDeposits,
						label: r.label,
						fill: 'origin',
						colorIndex: investments[i].colorIndex ?? i,
						hidden: investmentsViewStore.isHidden(investments[i].id),
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
					colorIndex: investments[i].colorIndex ?? i,
					hidden: investmentsViewStore.isHidden(investments[i].id),
				})),
	)
	const withdrawals = $derived([
		...data.map((r, i) => ({
			data: r.graphWithdrawals,
			label: r.label,
			fill: 'origin',
			colorIndex: investments[i].colorIndex ?? i,
			hidden: investmentsViewStore.isHidden(investments[i].id),
		})),
	])
	const withdrawalsWithInflation = $derived([
		{
			data: total.graphWithdrawals.map((w, i) => w - total.graphInflationWithdrawals[i]),
			label: '_hidden',
			borderColor: lowColor,
			borderWidth: 1,
			backgroundColor: 'transparent',
		},
	])

	const fees = $derived(
		adjustWithInflation
			? [
					...data.map((r, i) => ({
						data: r.graphFeeValues,
						label: r.label,
						fill: 'origin',
						backgroundColor: lowColor,
						hidden: investmentsViewStore.isHidden(investments[i].id),
					})),
					{
						data: total.graphFeeValues.map((w, i) => w - total.graphFeeValues[i]),
						label: '_hidden',
						borderColor: '#303030',
						borderWidth: 1,
						backgroundColor: 'transparent',
					},
				]
			: [
					...data.map((r, i) => ({
						data: r.graphFeeValues,
						label: r.label,
						fill: 'origin',
						backgroundColor: lowColor,
						hidden: investmentsViewStore.isHidden(investments[i].id),
					})),
				],
	)

	const investmentGraphData = $derived(
		adjustWithInflation
			? [
					...data.map((r, i) => ({
						data: r.graphInflationInvestmentValues,
						label: r.label,
						fill: 'origin',
						colorIndex: investments[i].colorIndex,
						stack: 'g1',
						hidden: investmentsViewStore.isHidden(investments[i].id),
					})),
					{
						data: total.graphInvestmentValues,
						label: '_hidden',
						fill: 'origin',
						stack: 'g2',
						borderColor: '#30303090',
						backgroundColor: 'transparent',
						borderWidth: 1,
					},
				]
			: data.map((r, i) => ({
					data: r.graphInvestmentValues,
					label: r.label,
					fill: 'origin',
					stack: 'g1',
					colorIndex: investments[i].colorIndex,
					hidden: investmentsViewStore.isHidden(investments[i].id),
				})),
	)

	function getTotalValue() {
		const filteredInvestments = data.filter(
			(r, i) => !investmentsViewStore.isHidden(investments[i].id),
		)
		const totalValue: number[] = new Array(total.graphLabels.length)
		const totalWithInflation: number[] = new Array(total.graphLabels.length)
		if (filteredInvestments.length > 0) {
			for (let i = 0; i < filteredInvestments[0].graphInvestmentValues.length; i++) {
				let sum = 0
				let sumWithInflation = 0
				for (let j = 0; j < filteredInvestments.length; j++) {
					sum += filteredInvestments[j].graphInvestmentValues[i]
					sumWithInflation += filteredInvestments[j].graphInflationInvestmentValues[i]
				}
				totalValue[i] = sum
				totalWithInflation[i] = sumWithInflation
			}
		}
		return { totalValue, totalWithInflation }
	}

	function getTotalDeposits() {
		const filteredInvestments = data.filter(
			(r, i) => !investmentsViewStore.isHidden(investments[i].id),
		)
		const totalDeposits: number[] = new Array(total.graphLabels.length)
		const totalDepositsWithInflation: number[] = new Array(total.graphLabels.length)
		if (filteredInvestments.length > 0) {
			for (let i = 0; i < filteredInvestments[0].graphDeposits.length; i++) {
				let sum = 0
				let sumWithInflation = 0
				for (let j = 0; j < filteredInvestments.length; j++) {
					sum += filteredInvestments[j].graphDeposits[i]
					sumWithInflation += filteredInvestments[j].graphInflationDeposits[i]
				}
				totalDeposits[i] = sum
				totalDepositsWithInflation[i] = sumWithInflation
			}
		}
		return { totalDeposits, totalDepositsWithInflation }
	}
	function getTotalWithdrawals() {
		const filteredInvestments = data.filter(
			(r, i) => !investmentsViewStore.isHidden(investments[i].id),
		)
		const totalWithdrawals: number[] = new Array(total.graphLabels.length)
		const totalWithdrawalsWithInflation: number[] = new Array(total.graphLabels.length)
		if (filteredInvestments.length > 0) {
			for (let i = 0; i < filteredInvestments[0].graphWithdrawals.length; i++) {
				let sum = 0
				let sumWithInflation = 0
				for (let j = 0; j < filteredInvestments.length; j++) {
					sum += filteredInvestments[j].graphWithdrawals[i]
					sumWithInflation += filteredInvestments[j].graphInflationWithdrawals[i]
				}
				totalWithdrawals[i] = sum
				totalWithdrawalsWithInflation[i] = sumWithInflation
			}
		}
		return { totalWithdrawals, totalWithdrawalsWithInflation }
	}

	function getTotalFees() {
		const filteredInvestments = data.filter(
			(r, i) => !investmentsViewStore.isHidden(investments[i].id),
		)
		const totalFees: number[] = new Array(total.graphLabels.length)
		const totalFeesWithInflation: number[] = new Array(total.graphLabels.length)
		if (filteredInvestments.length > 0) {
			for (let i = 0; i < filteredInvestments[0].graphFeeValues.length; i++) {
				let sum = 0
				let sumWithInflation = 0
				for (let j = 0; j < filteredInvestments.length; j++) {
					sum += filteredInvestments[j].graphFeeValues[i]
					sumWithInflation += filteredInvestments[j].graphFeeValues[i]
				}
				totalFees[i] = sum
				totalFeesWithInflation[i] = sumWithInflation
			}
		}
		return { totalFees, totalFeesWithInflation }
	}

	const { totalValue, totalWithInflation } = $derived(getTotalValue())
	const { totalDeposits, totalDepositsWithInflation } = $derived(getTotalDeposits())
	const { totalWithdrawals, totalWithdrawalsWithInflation } = $derived(getTotalWithdrawals())
	const { totalFees, totalFeesWithInflation } = $derived(getTotalFees())

	function getDateFromGraphLabels(graphLabels: string) {
		const month = graphLabels.includes('-') ? graphLabels : undefined
		if (month) {
			const [year, monthNum] = month.split('-').map(Number)
			return new Date(year, monthNum - 1).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
			})
		} else {
			return new Date(Number(graphLabels), 11).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
			})
		}
	}
	let fullscreenGraph: undefined | 'value' | 'transactions' | 'breakdown' = $state(undefined)
	let investmentsTooltipData: TooltipData[] = $state([])
	let transactionTooltipData: TooltipData[] = $state([])

	let tooltipPosition = $state({ x: 0, y: 0 })
</script>

{#snippet valueChart()}
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
					onClick: (e, item) => {
						const index = item.datasetIndex
						if (index !== undefined) investmentsViewStore.toggleHide(investments[index].id)
					},
					position: 'bottom',
					labels: {
						filter: (legendItem) => !legendItem.text.endsWith('_hidden'),
						useBorderRadius: true,
						borderRadius: 1,
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
							investmentsTooltipData = tooltip.dataPoints
								.filter((d) => d.raw !== 0 && !d?.dataset?.label?.startsWith('_hidden'))
								.map((d) => {
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
		]}
	/>
	<TooltipInvestment
		{tooltipPosition}
		tooltipData={investmentsTooltipData}
		{totalValue}
		{totalWithInflation}
		{adjustWithInflation}
		currency={portfolio.currency}
		labels={data[0]?.graphLabels}
	/>
{/snippet}
{#snippet transactionsChart()}
	<Chart
		type="bar"
		labels={data[0]?.graphLabels}
		datasets={[
			...(showDeposits ? deposits : []),
			...(showWithdrawals ? withdrawals : []),
			...(showFees ? fees : []),
			...(showWithdrawals && adjustWithInflation ? withdrawalsWithInflation : []),
		]}
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
					enabled: false,
					external: (context) => {
						const { tooltip } = context

						if (tooltip.opacity === 0) {
							transactionTooltipData = []
						} else {
							tooltipPosition = {
								x: tooltip.caretX,
								y: tooltip.caretY,
							}

							transactionTooltipData = tooltip.dataPoints
								.filter((d) => d.raw !== 0)
								.map((d) => {
									const dataset = d.dataset as CustomDataset<'bar'>
									return {
										dataIndex: d.dataIndex,
										value: d.raw as number,
										colorIndex: dataset.colorIndex,
										name: dataset.label,
										type: dataset.colorIndex !== undefined ? 'transaction' : 'fee',
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
		]}
	/>
	<TooltipTransaction
		{tooltipPosition}
		tooltipData={transactionTooltipData}
		{totalDeposits}
		{totalDepositsWithInflation}
		{totalWithdrawals}
		{totalWithdrawalsWithInflation}
		{totalFees}
		{totalFeesWithInflation}
		{adjustWithInflation}
		{showFees}
		currency={portfolio.currency}
		labels={data[0]?.graphLabels}
	/>
{/snippet}
{#snippet breakdownChart()}
	<div class="doughnut">
		<ChartDoughnut
			data={data.map((d) => d.graphInvestmentValues[selectedIndex])}
			labels={data.map((d) => d.label)}
			{investments}
			{investmentsViewStore}
		/>
	</div>
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
			<Typography class="selected-date"
				>{getDateFromGraphLabels(data[0].graphLabels[selectedIndex])}</Typography
			>
		</div>
	</div>
{/snippet}

{#if investments.length === 0 || data.length === 0}
	<section class="graph">
		<Typography variant="h1">No data</Typography>
	</section>
{:else}
	<section
		class="graph"
		class:fullscreen-graph={isGraphFullscreened}
		class:sidebar-open={isSidebarOpen}
		class:view
	>
		{#if isGraphFullscreened}
			<FullscreenGraph
				{view}
				{sidebarButton}
				bind:adjustWithInflation
				graphName={$_('common.value')}
				fullscreen={() => {
					fullscreenGraph = undefined
					fullscreen()
				}}
				infaltion={portfolio.inflation_rate}
				hidden={fullscreenGraph !== 'value'}
			>
				{@render valueChart()}
			</FullscreenGraph>
		{:else}
			<div class="graph-main">
				<Horizontal --horizontal-gap="var(--half-padding)" --padding-left="0">
					<Typography variant="h5">{title}</Typography>
					<FlexItem />
					{#if view}
						<Button
							dimension="small"
							variant="ghost"
							onclick={() => {
								fullscreenGraph = 'transactions'
								fullscreen()
							}}><ArrowRight size={16} /></Button
						>
					{:else}
						<Button
							dimension="small"
							variant="ghost"
							onclick={() => {
								fullscreenGraph = 'value'
								fullscreen()
							}}><Maximize size={16} /></Button
						>
					{/if}
				</Horizontal>
				{@render valueChart()}
			</div>
		{/if}
		{#if isGraphFullscreened}
			<FullscreenGraph
				{view}
				{sidebarButton}
				bind:adjustWithInflation
				graphName={$_('common.transactions')}
				fullscreen={() => {
					fullscreenGraph = undefined
					fullscreen()
				}}
				infaltion={portfolio.inflation_rate}
				hidden={fullscreenGraph !== 'transactions'}
			>
				{#snippet controls()}
					<Checkbox dimension="small" label={$_('common.deposits')} bind:checked={showDeposits}
					></Checkbox>
					<Checkbox
						dimension="small"
						label={$_('common.withdrawals')}
						bind:checked={showWithdrawals}
					></Checkbox>
					<Checkbox dimension="small" label={$_('common.fees')} bind:checked={showFees}></Checkbox>
				{/snippet}
				{@render transactionsChart()}
			</FullscreenGraph>
		{:else}
			<div class="graph-main-sub">
				<Horizontal
					--horizontal-gap="var(--half-padding)"
					--padding-left={isGraphFullscreened && !isSidebarOpen ? '42px' : '0'}
				>
					<Typography variant="h5">{$_('common.transactions')}</Typography>
					{#if isGraphFullscreened}
						<Toggle
							label={$_('common.showInflation')}
							dimension="small"
							bind:checked={adjustWithInflation}
						></Toggle>
						{#if adjustWithInflation}
							<Badge dimension="small">{portfolio.inflation_rate * 100}%</Badge>
						{/if}
					{/if}
					<FlexItem />
					{#if view}
						<Button
							dimension="small"
							variant="ghost"
							onclick={() => {
								fullscreenGraph = 'transactions'
								fullscreen()
							}}><ArrowRight size={16} /></Button
						>
					{:else}
						<Checkbox dimension="small" label={$_('common.deposits')} bind:checked={showDeposits}
						></Checkbox>
						<Checkbox
							dimension="small"
							label={$_('common.withdrawals')}
							bind:checked={showWithdrawals}
						></Checkbox>
						<Checkbox dimension="small" label={$_('common.fees')} bind:checked={showFees}
						></Checkbox>

						<Button
							dimension="small"
							variant="ghost"
							onclick={() => {
								fullscreenGraph = 'transactions'
								fullscreen()
							}}><Maximize size={16} /></Button
						>
					{/if}
				</Horizontal>
				{@render transactionsChart()}
			</div>
		{/if}
		{#if isGraphFullscreened}
			<FullscreenGraph
				{view}
				{sidebarButton}
				bind:adjustWithInflation
				graphName={$_('common.breakdown')}
				fullscreen={() => {
					fullscreenGraph = undefined
					fullscreen()
				}}
				infaltion={portfolio.inflation_rate}
				hidden={fullscreenGraph !== 'breakdown'}
			>
				{#snippet controls()}
					<Button
						dimension="small"
						variant="solid"
						onclick={() => {
							const today = new Date().toISOString()
							let [year, month] = today.split('T')[0].split('-')
							month = month.replace('0', '')

							const hasMonth = data[0].graphLabels.every((l) => l.includes('-'))

							const targetLabel = hasMonth ? `${year}-${month}` : year
							const index = data[0].graphLabels.indexOf(targetLabel)

							if (index > 0 && index < data[0].graphLabels.length - 1) {
								selectedIndex = index
							} else {
								console.error('Out of range')
							}
						}}>{$_('common.showToday')}</Button
					>
				{/snippet}
				{@render breakdownChart()}
			</FullscreenGraph>
		{:else}
			<div class="graph-breakdown-overtime">
				<Horizontal
					--horizontal-gap="var(--half-padding)"
					--padding-left={isGraphFullscreened && !isSidebarOpen ? '42px' : '0'}
				>
					<Typography variant="h5">{$_('common.breakdown')}</Typography>
					{#if isGraphFullscreened}
						<Toggle
							label={$_('common.showInflation')}
							dimension="small"
							bind:checked={adjustWithInflation}
						></Toggle>
						{#if adjustWithInflation}
							<Badge dimension="small">{portfolio.inflation_rate * 100}%</Badge>
						{/if}
					{/if}
					<FlexItem />
					{#if view}
						<Button
							dimension="small"
							variant="ghost"
							onclick={() => {
								fullscreenGraph = 'breakdown'
								fullscreen()
							}}><ArrowRight size={16} /></Button
						>
					{:else}
						<!-- else content here -->
						<Button
							dimension="small"
							variant="solid"
							onclick={() => {
								const today = new Date().toISOString()
								let [year, month] = today.split('T')[0].split('-')
								month = month.replace('0', '')

								const hasMonth = data[0].graphLabels.every((l) => l.includes('-'))

								const targetLabel = hasMonth ? `${year}-${month}` : year
								const index = data[0].graphLabels.indexOf(targetLabel)

								if (index > 0 && index < data[0].graphLabels.length - 1) {
									selectedIndex = index
								} else {
									console.error('Out of range')
								}
							}}>{$_('common.showToday')}</Button
						>
						<Button
							dimension="small"
							variant="ghost"
							onclick={() => {
								fullscreenGraph = 'breakdown'
								fullscreen()
							}}><Maximize size={16} /></Button
						>
					{/if}
				</Horizontal>
				{@render breakdownChart()}
			</div>
		{/if}
	</section>
{/if}

<style>
	:global(.selected-date) {
		white-space: nowrap;
	}
	.date {
		display: flex;
		justify-content: end;
		width: 85px;
	}
	.graph {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		width: 100%;
		max-width: calc(100% - calc(var(--sidebar-width) + var(--padding)));
		gap: var(--padding);

		.graph-main {
			width: 100%;
			aspect-ratio: 1000 / 252;
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
			aspect-ratio: 1000 / 192;
			background-color: var(--colors-base);
			display: flex;
			flex-direction: column;
			padding: var(--padding);
			border-radius: var(--border-radius);
			border: 1px solid var(--colors-low);
			gap: var(--half-padding);
		}

		.graph-breakdown-overtime {
			width: 100%;
			background-color: var(--colors-base);
			display: flex;
			flex-direction: column;
			padding: var(--padding);
			border-radius: var(--border-radius);
			border: 1px solid var(--colors-low);
			gap: var(--half-padding);
		}
		.doughnut {
			width: 120px;
			height: 120px;
		}
		.slider {
			display: flex;
			align-items: center right;
		}
	}
	.fullscreen-graph {
		max-width: 100%;
		&.sidebar-open {
			max-width: calc(100% - calc(var(--sidebar-width) + var(--padding)));
		}
		.doughnut {
			width: 100%;
			height: 100%;
		}
	}
	.view {
		max-width: 100%;
		min-height: 100%;
	}
</style>
