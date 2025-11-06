<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import type { Client, Goal, InvestmentWithColorIndex, Portfolio, Transaction } from '$lib/types'
	import { _ } from 'svelte-i18n'
	import EditTransaction from './edit-transaction.svelte'
	import Sidebar from './sidebar.svelte'
	import GoalCard from './goal-card.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import type { PortfolioSimulation } from '$lib/stores/portfolio-simulation.svelte'

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
		addGoal?: () => void
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
		addGoal,
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
		<Vertical --vertical-gap="0" class="dialog">
			<EditTransaction
				investment={selectedInvestment}
				{portfolio}
				{client}
				transaction={editedTransaction}
				showInflation={adjustWithInflation}
				close={closeDialog}
			/>
		</Vertical>
	{/if}
	<div class="investments-wrapper" class:hidden={selectedInvestment !== undefined}>
		<Vertical --vertical-gap="var(--half-padding)" class="investments">
			{#each goals as goal, i}
				<GoalCard
					investment={goal}
					{portfolio}
					{viewOnly}
					index={i}
					hidden={false}
					focused={false}
					showInflation={adjustWithInflation}
					{openTransaction}
					addInvestment={addGoal}
					toggleHide={() => {}}
					toggleFocus={() => {}}
					open={true}
					exhaustionWarning={graphData?.data[i]?.exhaustionWarning}
					isCalculating={graphData?.isCalculating &&
						(!graphData.currentCalculatingIndex || i >= graphData.currentCalculatingIndex)}
					{goal}
				/>
			{/each}
			{#if addGoal}
				<Button dimension="compact" variant="ghost" onclick={addGoal}>
					{$_('page.portfolio.addGoal')}</Button
				>
			{/if}
		</Vertical>
	</div>
</Sidebar>

<style>
	:global(.dialog) {
		padding: var(--half-padding);
		border-radius: var(--border-radius);
		background-color: var(--colors-low);
		border: 1px solid var(--colors-low);
	}
	:global(.investments) {
		background-color: var(--colors-low);
		padding: var(--half-padding);
		border-radius: var(--half-padding);
	}
	.investments-wrapper {
		&.hidden {
			display: none;
		}
	}
</style>
