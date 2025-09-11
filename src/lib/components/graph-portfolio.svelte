<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import type { Portfolio, InvestmentWithColorIndex } from '$lib/types'
	import { getGraphDataForPortfolio } from '$lib/@snaha/kalkul-maths'
	import { transactionStore } from '$lib/stores/transaction.svelte'
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
		isEmpty?: boolean
		clientBirthDate?: Date
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
		isEmpty,
		clientBirthDate,
	}: Props = $props()
	let showDeposits = $state(true)
	let showWithdrawals = $state(true)
	let showFees = $state(true)
	let showBreakdownInvestmentValue = $state(true)
	let showBreakdownInterestEarned = $state(true)
	let showBreakdownDeposited = $state(true)
	let showBreakdownWithdrawn = $state(true)
	let showBreakdownFees = $state(true)
	let selectedIndex = $state(0)

	const { total, data } = $derived(
		getGraphDataForPortfolio(transactionStore.data, investments, portfolio),
	)

	type FullscreenGraphType = 'value' | 'transactions' | 'breakdown'

	let fullscreenGraph: undefined | FullscreenGraphType = $state(undefined)

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

{#snippet controlsTransaction()}
	<Dropdown left buttonDimension="small" buttonVariant="ghost" autoClose={false}>
		{#snippet button()}
			<SettingsView size={16} />
		{/snippet}
		<List>
			<Checkbox dimension="small" bind:checked={showDeposits}>{$_('common.deposits')}</Checkbox>
			<Checkbox dimension="small" bind:checked={showWithdrawals}
				>{$_('common.withdrawals')}</Checkbox
			>
			<Checkbox dimension="small" bind:checked={showFees}>{$_('common.fees')}</Checkbox>
		</List>
	</Dropdown>
{/snippet}

{#snippet controlsBreakdown()}
	<Button dimension="small" variant="solid" onclick={() => (selectedIndex = breakdownSelectToday())}
		>{$_('common.showToday')}</Button
	>
	<Dropdown buttonDimension="small" buttonVariant="ghost" autoClose={false} up>
		{#snippet button()}
			<SettingsView size={16} />
		{/snippet}
		<List>
			<Checkbox dimension="small" bind:checked={showBreakdownInvestmentValue}
				>{$_('common.investmentValue')}</Checkbox
			>
			<Checkbox dimension="small" bind:checked={showBreakdownInterestEarned}
				>{$_('common.interestEarned')}</Checkbox
			>
			<Checkbox dimension="small" bind:checked={showBreakdownDeposited}
				>{$_('common.deposited')}</Checkbox
			>
			<Checkbox dimension="small" bind:checked={showBreakdownWithdrawn}
				>{$_('common.withdrawn')}</Checkbox
			>
			<Checkbox dimension="small" bind:checked={showBreakdownFees}>{$_('common.fees')}</Checkbox>
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

{#if investments.length === 0 || data.length === 0}
	<section class="graph">
		<Typography variant="h1">{$_('common.noData')}</Typography>
	</section>
{:else}
	<section
		class="graph"
		class:fullscreen-graph={isGraphFullscreened}
		class:sidebar-open={isSidebarOpen}
		class:view
		class:empty={isEmpty === true}
	>
		{#if isGraphFullscreened}
			<FullscreenGraph
				{view}
				{sidebarButton}
				bind:adjustWithInflation
				fullscreen={() => {
					fullscreenGraph = undefined
					fullscreen()
				}}
				inflation={portfolio.inflation_rate}
			>
				{#snippet graphName()}
					{#if fullscreenGraph === 'value'}
						{$_('common.value')}
					{:else if fullscreenGraph === 'transactions'}
						{$_('common.transactions')}
					{:else}
						{$_('common.breakdown')}
					{/if}
				{/snippet}
				{#snippet controls()}
					{#if fullscreenGraph === 'value'}
						<!--  -->
					{:else if fullscreenGraph === 'transactions'}
						{@render controlsTransaction()}
					{:else}
						{@render controlsBreakdown()}
					{/if}
				{/snippet}
				{#if fullscreenGraph === 'value'}
					<GraphPortfolioValue {graphValueData} {adjustWithInflation} {clientBirthDate} />
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
				{/if}
			</FullscreenGraph>
		{:else}
			<div class="graph-main">
				<Horizontal --horizontal-gap="var(--half-padding)" --padding-left="0">
					<Typography variant="h5">{title}</Typography>
					{#if investments && investments.length > 0}
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
					{@render fullscreenButton('value')}
				</Horizontal>
				<GraphPortfolioValue {graphValueData} {adjustWithInflation} {clientBirthDate} />
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
			</div>
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
					{#if !view}
						{@render controlsBreakdown()}
					{/if}
					{@render fullscreenButton('breakdown')}
				</Horizontal>
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
			</div>
		{/if}
	</section>
{/if}

<style>
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

		&.empty {
			opacity: 0.5;
		}
	}
	.fullscreen-graph {
		max-width: 100%;
		&.sidebar-open {
			max-width: calc(100% - calc(var(--sidebar-width) + var(--padding)));
		}
	}
	.view {
		max-width: 100%;
		min-height: 100%;
	}
</style>
