<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import type {
		Client,
		Investment,
		InvestmentWithColorIndex,
		Portfolio,
		Transaction,
	} from '$lib/types'
	import { _ } from 'svelte-i18n'
	import EditTransaction from './edit-transaction.svelte'
	import Sidebar from './sidebar.svelte'
	import InvestmentCard from './investment-card.svelte'
	import type { InvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import type { PortfolioSimulation } from '$lib/stores/portfolio-simulation.svelte'

	type Props = {
		isGraphFullscreened: boolean
		isSidebarOpen: boolean
		isSidebarFlexible: boolean
		selectedInvestment?: InvestmentWithColorIndex
		client: Client
		portfolio: Portfolio
		investments: Investment[]
		investmentsViewStore: InvestmentsViewStore
		transactionCount: number
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
		investments,
		investmentsViewStore,
		transactionCount,
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
	--sidebar-gap="var(--padding)"
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
		{#each investments as investment, i}
			<InvestmentCard
				{investment}
				{portfolio}
				{viewOnly}
				index={i}
				hidden={investmentsViewStore.isHidden(investment.id)}
				focused={investmentsViewStore.isFocused(investment.id) && investments.length > 1}
				showInflation={adjustWithInflation}
				{openTransaction}
				toggleHide={() => {
					investmentsViewStore.toggleHide(investment.id)
				}}
				toggleFocus={() => {
					investmentsViewStore.toggleFocus(investment.id)
				}}
				open={transactionCount === 0}
				exhaustionWarning={graphData?.data[i]?.exhaustionWarning}
				isCalculating={graphData?.isCalculating &&
					(!graphData.currentCalculatingIndex || i >= graphData.currentCalculatingIndex)}
			/>
		{/each}
		{#if addInvestment}
			<Button dimension="compact" variant="ghost" onclick={addInvestment}>
				{$_('page.portfolio.addInvestment')}</Button
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
