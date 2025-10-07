<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import type { Portfolio, InvestmentWithColorIndex } from '$lib/types'
	import type { GraphData as MathGraphData } from '$lib/@snaha/kalkul-maths'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import { _ } from 'svelte-i18n'
	import Button from './ui/button.svelte'
	import { Maximize, SettingsView } from 'carbon-icons-svelte'
	import Checkbox from './ui/checkbox.svelte'
	import type { InvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import Toggle from './ui/toggle.svelte'
	import Badge from './ui/badge.svelte'
	import FullscreenGraph from './graph-fullscreen.svelte'
	import type { Snippet } from 'svelte'
	import GraphPortfolioValue from './graph-portfolio-value.svelte'
	import GraphPortfolioTransactions from './graph-portfolio-transactions.svelte'
	import GraphPortfolioBreakdown from './graph-portfolio-breakdown.svelte'
	import { deriveGraphPortfolioTransactions, deriveGraphValueData } from '$lib/graph'
	import { getCSSVariableValue } from '$lib/css-vars'
	import Dropdown from './ui/dropdown.svelte'
	import List from './ui/list/list.svelte'
	import Select from './ui/select/select.svelte'
	import MobileOnly from './mobile-only.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import DesktopOnly from './desktop-only.svelte'
	import LoadingOverlay from './loading-overlay.svelte'
	import InvestmentColorBox from './investment-color-box.svelte'
	import Vertical from './ui/vertical.svelte'

	interface Props {
		portfolio: Portfolio
		investments: InvestmentWithColorIndex[]
		adjustWithInflation: boolean
		simulationData: {
			data: MathGraphData[]
			total: MathGraphData
			isCalculating?: boolean
			progress?: number
		}
		title?: string
		investmentsViewStore: InvestmentsViewStore
		fullscreen: () => void
		isGraphFullscreened: boolean
		fullscreenGraph?: FullscreenGraphType
		isSidebarOpen: boolean
		view?: boolean
		sidebarButton?: Snippet
		isEmpty?: boolean
		clientBirthDate?: Date
	}

	let {
		investments,
		portfolio,
		simulationData,
		adjustWithInflation = $bindable(),
		investmentsViewStore,
		fullscreen,
		isGraphFullscreened,
		fullscreenGraph = $bindable(undefined),
		isSidebarOpen = $bindable(),
		view = false,
		sidebarButton,
		isEmpty,
		clientBirthDate,
	}: Props = $props()

	const data = $derived(simulationData.data)
	const total = $derived(simulationData.total)
	const isCalculating = $derived(simulationData.isCalculating ?? false)

	let showDeposits = $state(true)
	let showWithdrawals = $state(true)
	let showFees = $state(true)
	let showBreakdownInvestmentValue = $state(true)
	let showBreakdownInterestEarned = $state(true)
	let showBreakdownDeposited = $state(true)
	let showBreakdownWithdrawn = $state(true)
	let showBreakdownFees = $state(true)
	let selectedIndex = $state(0)
	let showBreakdown = $state(false)

	type FullscreenGraphType = 'value' | 'transactions' | 'breakdown'

	const lowColor = getCSSVariableValue('--colors-low')
	const baseColor = `${getCSSVariableValue('--colors-base')}cc`
	const graphValueData = $derived(
		deriveGraphValueData({
			investments,
			portfolio,
			investmentsViewStore,
			data,
			total,
			lowColor,
			baseColor,
		}),
	)
	const graphTransactionsData = $derived(
		deriveGraphPortfolioTransactions({
			data,
			total,
			investments,
			investmentsViewStore,
			lowColor,
			baseColor,
		}),
	)

	const controlSize = $derived(layoutStore.mobile ? 'compact' : 'small')
	const controlIconSize = $derived(layoutStore.mobile ? 20 : 16)

	function breakdownSelectToday() {
		const today = new Date().toISOString()
		let [year, month] = today.split('T')[0].split('-')
		month = month.replace('0', '')

		const hasMonth = data[0].graphLabels.every((l) => l.includes('-'))

		const targetLabel = hasMonth ? `${year}-${month}` : year
		const index = data[0].graphLabels.indexOf(targetLabel)

		if (index > 0 && index < data[0].graphLabels.length - 1) {
			return index
		} else {
			return 0
		}
	}

	$effect(() => {
		if (data.length > 0) {
			selectedIndex = breakdownSelectToday()
		}
	})
</script>

{#snippet inflationToggle()}
	<Horizontal --horizontal-justify-content="space-between">
		<Toggle
			label={$_('common.showInflation')}
			dimension={controlSize}
			bind:checked={adjustWithInflation}
		></Toggle>
		<Badge dimension="small">{portfolio.inflation_rate * 100}%</Badge>
	</Horizontal>
{/snippet}

{#snippet controlsValue()}
	<MobileOnly>
		<Dropdown left buttonDimension={controlSize} buttonVariant="ghost" autoClose={false}>
			{#snippet button()}
				<SettingsView size={controlIconSize} />
			{/snippet}
			<List>
				{@render inflationToggle()}
			</List>
		</Dropdown>
	</MobileOnly>
{/snippet}

{#snippet controlsTransaction()}
	<Dropdown left buttonDimension={controlSize} buttonVariant="ghost" autoClose={false}>
		{#snippet button()}
			<SettingsView size={controlIconSize} />
		{/snippet}
		<List>
			<MobileOnly>
				{@render inflationToggle()}
			</MobileOnly>
			<Checkbox dimension={controlSize} bind:checked={showDeposits}
				>{$_('common.deposits')}</Checkbox
			>
			<Checkbox dimension={controlSize} bind:checked={showWithdrawals}
				>{$_('common.withdrawals')}</Checkbox
			>
			<Checkbox dimension={controlSize} bind:checked={showFees}>{$_('common.fees')}</Checkbox>
		</List>
	</Dropdown>
{/snippet}

{#snippet controlsBreakdown()}
	<DesktopOnly>
		<Button
			dimension={controlSize}
			variant="solid"
			onclick={() => (selectedIndex = breakdownSelectToday())}>{$_('common.showToday')}</Button
		>
	</DesktopOnly>
	<Dropdown
		buttonDimension={controlSize}
		buttonVariant="ghost"
		autoClose={false}
		up={!isGraphFullscreened}
		left={isGraphFullscreened}
	>
		{#snippet button()}
			<SettingsView size={controlIconSize} />
		{/snippet}
		<List>
			<MobileOnly>
				{@render inflationToggle()}
			</MobileOnly>

			<Checkbox dimension={controlSize} bind:checked={showBreakdownInvestmentValue}
				>{$_('common.investmentValue')}</Checkbox
			>
			<Checkbox dimension={controlSize} bind:checked={showBreakdownInterestEarned}
				>{$_('common.interestEarned')}</Checkbox
			>
			<Checkbox dimension={controlSize} bind:checked={showBreakdownDeposited}
				>{$_('common.deposited')}</Checkbox
			>
			<Checkbox dimension={controlSize} bind:checked={showBreakdownWithdrawn}
				>{$_('common.withdrawn')}</Checkbox
			>
			<Checkbox dimension={controlSize} bind:checked={showBreakdownFees}
				>{$_('common.fees')}</Checkbox
			>
			<MobileOnly>
				<Button
					dimension={controlSize}
					variant="ghost"
					onclick={() => (selectedIndex = breakdownSelectToday())}>{$_('common.showToday')}</Button
				>
			</MobileOnly>
		</List>
	</Dropdown>
{/snippet}

{#snippet fullscreenButton(graph: FullscreenGraphType)}
	<Button
		dimension="small"
		variant="ghost"
		onclick={() => {
			fullscreenGraph = graph
			fullscreen()
		}}><Maximize size={16} /></Button
	>
{/snippet}

{#if investments.length === 0}
	<section class="graph">
		<Typography variant="h1">{$_('common.noData')}</Typography>
	</section>
{:else if data.length === 0}
	<section class="graph">
		<LoadingOverlay visible={true} />
	</section>
{:else}
	<section
		class="graph"
		class:fullscreen-graph={isGraphFullscreened}
		class:sidebar-open={isSidebarOpen}
		class:view
		class:empty={isEmpty === true}
		class:mobile={layoutStore.mobile}
	>
		{#if isGraphFullscreened}
			<FullscreenGraph
				{view}
				{sidebarButton}
				bind:adjustWithInflation
				bind:isSidebarOpen
				fullscreen={() => {
					fullscreenGraph = undefined
					fullscreen()
				}}
				inflation={portfolio.inflation_rate}
			>
				{#snippet graphName()}
					{portfolio.name}
				{/snippet}
				{#snippet controls()}
					{#if fullscreenGraph === 'value'}
						{@render controlsValue()}
					{:else if fullscreenGraph === 'transactions'}
						{@render controlsTransaction()}
					{:else}
						{@render controlsBreakdown()}
					{/if}
				{/snippet}
				{#snippet valueChanger()}
					<Select
						variant="solid"
						dimension="compact"
						bind:value={fullscreenGraph}
						items={[
							{ value: 'value', label: $_('common.value') },
							{ value: 'transactions', label: $_('common.transactions') },
							{ value: 'breakdown', label: $_('common.breakdown') },
						]}
						class="max-select-length {layoutStore.mobile ? 'mobile' : ''}"
					></Select>
				{/snippet}
				{#if fullscreenGraph === 'value'}
					<GraphPortfolioValue {graphValueData} {adjustWithInflation} {clientBirthDate} />
					<LoadingOverlay visible={isCalculating} />
				{:else if fullscreenGraph === 'transactions'}
					<GraphPortfolioTransactions
						{portfolio}
						{adjustWithInflation}
						{graphTransactionsData}
						{showDeposits}
						{showWithdrawals}
						{showFees}
						{clientBirthDate}
					/>
					<LoadingOverlay visible={isCalculating} />
				{:else}
					<GraphPortfolioBreakdown
						{portfolio}
						{data}
						{total}
						{investments}
						{adjustWithInflation}
						{investmentsViewStore}
						bind:selectedIndex
						{lowColor}
						{baseColor}
						{clientBirthDate}
						showInvestmentValue={showBreakdownInvestmentValue}
						showInterestEarned={showBreakdownInterestEarned}
						showDeposited={showBreakdownDeposited}
						showWithdrawn={showBreakdownWithdrawn}
						showFees={showBreakdownFees}
					/>
					<LoadingOverlay visible={isCalculating} />
				{/if}
			</FullscreenGraph>
		{:else}
			<div class="graph-main">
				<Horizontal --horizontal-gap="var(--half-padding)" --padding-left="0">
					{#if showBreakdown}
						<Typography variant="h5">{$_('common.breakdown')}</Typography>
						<Button
							variant="ghost"
							dimension="small"
							onclick={() => {
								showBreakdown = false
							}}>{$_('common.viewValue')}</Button
						>
						<FlexItem />
						{@render fullscreenButton('breakdown')}
					{:else}
						<Typography variant="h5">{$_('common.value')}</Typography>
						<Button
							variant="ghost"
							dimension="small"
							onclick={() => {
								showBreakdown = true
							}}>{$_('common.viewBreakdown')}</Button
						>
						<FlexItem />
						{@render fullscreenButton('value')}
					{/if}
				</Horizontal>
				{#if showBreakdown}
					<Vertical --vertical-justify-content="center" class="flex">
						<GraphPortfolioBreakdown
							{portfolio}
							{data}
							{total}
							{investments}
							{adjustWithInflation}
							{investmentsViewStore}
							bind:selectedIndex
							{lowColor}
							{baseColor}
							{clientBirthDate}
							showInvestmentValue={showBreakdownInvestmentValue}
							showInterestEarned={showBreakdownInterestEarned}
							showDeposited={showBreakdownDeposited}
							showWithdrawn={showBreakdownWithdrawn}
							showFees={showBreakdownFees}
						/>
						<LoadingOverlay visible={isCalculating} />
					</Vertical>
				{:else}
					<GraphPortfolioValue {graphValueData} {adjustWithInflation} {clientBirthDate} />
					<LoadingOverlay visible={isCalculating} />
				{/if}
			</div>
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
					{#if !view}
						{@render controlsTransaction()}
					{/if}
					{@render fullscreenButton('transactions')}
				</Horizontal>
				<GraphPortfolioTransactions
					{graphTransactionsData}
					{portfolio}
					{adjustWithInflation}
					{showDeposits}
					{showWithdrawals}
					{showFees}
					{clientBirthDate}
				/>
				<LoadingOverlay visible={isCalculating} />
			</div>
			<Horizontal --horizontal-justify-content="space-between">
				<Horizontal
					--horizontal-gap="var(--half-padding)"
					--horizontal-justify-content="start"
					style="min-width: 200px"
				>
					<Toggle
						label={$_('common.showInflation')}
						dimension="small"
						bind:checked={adjustWithInflation}
					></Toggle>
					{#if adjustWithInflation}
						<Badge dimension="small">{portfolio.inflation_rate * 100}%</Badge>
					{/if}
				</Horizontal>
				<Horizontal class="wrap">
					{#each investments as investment}
						<Button
							variant="ghost"
							dimension="small"
							onclick={() => investmentsViewStore.toggleHide(investment.id)}
						>
							<Horizontal --horizontal-gap="var(--quarter-padding)">
								<InvestmentColorBox
									width="24px"
									height="16px"
									colorIndex={investment.colorIndex}
								/><Typography
									variant="small"
									nowrap
									lineThrough={investmentsViewStore.isHidden(investment.id)}
									>{investment.name}</Typography
								>
							</Horizontal>
						</Button>
					{/each}
				</Horizontal>
			</Horizontal>
		{/if}
	</section>
{/if}

<style>
	:root {
		--min-chart-height: 632px;
	}
	.graph {
		display: flex;
		flex-direction: column;
		min-height: var(--min-chart-height);
		max-height: max(var(--min-chart-height), calc(100dvh - var(--header-height)));
		overflow-y: auto;
		width: 100%;
		max-width: calc(100% - calc(var(--sidebar-width)));
		gap: var(--half-padding);
		padding: var(--half-padding);

		.graph-main {
			flex: 210;
			width: 100%;
			min-height: 0;
			background-color: var(--colors-base);
			display: flex;
			flex-direction: column;
			padding: var(--padding);
			border-radius: var(--border-radius);
			border: 1px solid var(--colors-low);
			gap: var(--half-padding);
			position: relative;
		}

		.graph-main-sub {
			flex: 210;
			width: 100%;
			min-height: 0; /*aspect-ratio: 1000 / 192;*/
			background-color: var(--colors-base);
			display: flex;
			flex-direction: column;
			padding: var(--padding);
			border-radius: var(--border-radius);
			border: 1px solid var(--colors-low);
			gap: var(--half-padding);
			position: relative;
		}

		&.empty {
			opacity: 0.5;
		}
	}
	.graph.mobile {
		min-height: 0;
	}
	.fullscreen-graph {
		max-width: 100%;
		flex: 1;
		padding: 0;
		&.sidebar-open {
			max-width: calc(100% - calc(var(--sidebar-width)));
		}
	}
	.view {
		max-width: 100%;
		min-height: 100%;
	}
	:global(.max-select-length) {
		max-width: 164px;
	}
	:global(.max-select-length.mobile) {
		max-width: 100%;
	}
	:global(.wrap) {
		flex-wrap: wrap;
	}
	:global(.flex) {
		flex: 1;
	}
	:global(.red) {
		color: var(--colors-red);
	}
</style>
