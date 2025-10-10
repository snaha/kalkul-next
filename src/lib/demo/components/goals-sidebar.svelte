<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import type { Client, InvestmentWithColorIndex, Portfolio, Transaction } from '$lib/types'
	import { _, locale } from 'svelte-i18n'
	import EditTransaction from '$lib/components/edit-transaction.svelte'
	import Sidebar from '$lib/components/sidebar.svelte'
	import GoalCard from './goal-card.svelte'
	import type { PortfolioSimulation } from '$lib/stores/portfolio-simulation.svelte'
	import { goalToInvestment, goalToTransactions, type Goal } from '$lib/demo/stores/demo.svelte'
	import { notImplemented } from '$lib/demo/utils'

	type Props = {
		isGraphFullscreened: boolean
		isSidebarOpen: boolean
		isSidebarFlexible: boolean
		selectedInvestment?: InvestmentWithColorIndex
		client: Client
		portfolio: Portfolio
		goals: Goal[]
		editedTransaction?: Transaction
		adjustWithInflation: boolean
		viewOnly: boolean
		graphData?: PortfolioSimulation
		closeDialog?: () => void
		openTransaction?: (investment: InvestmentWithColorIndex, transaction?: Transaction) => void
		addInvestment?: () => void
	}

	let {
		isGraphFullscreened,
		isSidebarOpen = $bindable(),
		isSidebarFlexible,
		selectedInvestment,
		client,
		portfolio,
		goals,
		editedTransaction,
		adjustWithInflation,
		viewOnly,
		graphData,
		closeDialog,
		openTransaction,
		addInvestment,
	}: Props = $props()
</script>

<Sidebar
	--sidebar-gap="var(--half-padding)"
	--sidebar-padding="0"
	{isGraphFullscreened}
	{isSidebarOpen}
	{isSidebarFlexible}
>
	{#if selectedInvestment !== undefined && closeDialog}
		<section class="vertical dialog">
			<EditTransaction
				investment={selectedInvestment}
				{portfolio}
				{client}
				transaction={editedTransaction}
				showInflation={adjustWithInflation}
				close={closeDialog}
			/>
		</section>
	{/if}
	<section class="investments" class:hidden={selectedInvestment !== undefined}>
		{#each goals as goal, i}
			{@const investment = goalToInvestment(goal)}
			{@const transactions = goalToTransactions(goal)}
			<GoalCard
				{investment}
				{portfolio}
				{viewOnly}
				index={i}
				hidden={false}
				focused={false}
				showInflation={adjustWithInflation}
				{openTransaction}
				{addInvestment}
				toggleHide={() => {}}
				toggleFocus={() => {}}
				open={true}
				{transactions}
				{goal}
				exhaustionWarning={graphData?.data[i]?.exhaustionWarning}
				isCalculating={graphData?.isCalculating &&
					(!graphData.currentCalculatingIndex || i >= graphData.currentCalculatingIndex)}
			/>
		{/each}
		{#if addInvestment}
			<Button dimension="compact" variant="ghost" onclick={() => notImplemented($locale)}>
				{$_('page.portfolio.addGoal')}</Button
			>
		{/if}
	</section>
</Sidebar>

<style>
	.dialog {
		padding: var(--half-padding);
		border-radius: var(--border-radius);
		background-color: var(--colors-low);
		border: 1px solid var(--colors-low);
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0;
	}
	.investments {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		background-color: var(--colors-low);
		padding: var(--half-padding);
		border-radius: var(--half-padding);
		&.hidden {
			display: none;
		}
	}
</style>
