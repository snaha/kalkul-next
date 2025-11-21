<script lang="ts">
	import { cascadeDuplicateInvestment } from '$lib/cascade'
	import type { InvestmentWithColorIndex, Portfolio, Transaction } from '$lib/types'
	import {
		CenterSquare,
		ChevronRight,
		Copy,
		OverflowMenuVertical,
		Settings,
		TrashCan,
		ViewOff,
		WarningAltFilled,
	} from 'carbon-icons-svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import List from '$lib/components/ui/list/list.svelte'
	import ListItem from '$lib/components/ui/list/list-item.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import FlexItem from '$lib/components/ui/flex-item.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import TransactionCard from './transaction-card.svelte'
	import Divider from '$lib/components/ui/divider.svelte'
	import adapters from '$lib/adapters'
	import { base } from '$app/paths'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import DeleteModal from '$lib/components/delete-modal.svelte'
	import InvestmentColorBox from '$lib/components/investment-color-box.svelte'
	import Badge from '$lib/components/ui/badge.svelte'
	import Loader from '$lib/components/ui/loader.svelte'

	type Props = {
		investment: InvestmentWithColorIndex
		portfolio: Portfolio
		viewOnly?: boolean
		index: number
		hidden: boolean
		focused: boolean
		showInflation?: boolean
		openTransaction?: (investment: InvestmentWithColorIndex, transaction?: Transaction) => void
		toggleHide: () => void
		toggleFocus: () => void
		open?: boolean
		exhaustionWarning?: import('$lib/@snaha/kalkul-maths').ExhaustionWarning
		isCalculating?: boolean
		transactions?: Transaction[]
		onEditInvestment?: (investmentId: string) => void
		onDeleteInvestment?: (investmentId: string) => Promise<void>
		transactionGoalMap?: Map<string, string>
	}

	let {
		investment,
		portfolio,
		viewOnly = false,
		index,
		hidden,
		focused,
		showInflation = false,
		openTransaction,
		toggleHide,
		toggleFocus,
		open = $bindable(false),
		exhaustionWarning,
		isCalculating = false,
		transactions: transactionsProp,
		onEditInvestment,
		onDeleteInvestment,
		transactionGoalMap,
	}: Props = $props()

	let selectedTransactionIdForDeletion: string | undefined = $state(undefined)
	let showDeleteInvestmentModal = $state(false)
	const transactions = $derived(
		transactionsProp !== undefined
			? transactionsProp.filter((t) => t.investment_id === investment.id)
			: transactionStore.filter(investment.id),
	)

	function cardOpenInvestment(e: MouseEvent) {
		if (e.defaultPrevented) {
			return
		}
		toggleInvestment()
	}

	function toggleInvestment() {
		open = !open
	}

	function editInvestment() {
		if (onEditInvestment) {
			onEditInvestment(investment.id)
		} else {
			goto(routes.EDIT_INVESTMENT(portfolio.client, portfolio.id, investment.id))
		}
	}

	async function deleteInvestment(investmentId: string) {
		if (onDeleteInvestment) {
			await onDeleteInvestment(investmentId)
		} else {
			await adapters.deleteInvestment({ id: investmentId })
		}
	}

	$effect(() => {
		investment.colorIndex = index
	})
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" onclick={cardOpenInvestment} class:hidden class:open>
	<Horizontal --horizontal-gap="var(--quarter-padding)">
		<div class="chevron">
			<ChevronRight
				size={24}
				class="open-investment-icon"
				color={hidden ? 'transparent' : undefined}
			/>
		</div>
		<InvestmentColorBox colorIndex={investment.colorIndex ?? 0} />
		<Typography variant="h5" class="investment-name">{investment.name}</Typography>
		<FlexItem />
		{#if exhaustionWarning && !open}
			<Badge variant="error">
				<WarningAltFilled size={16} />
			</Badge>
		{/if}
		{#if isCalculating}
			<Loader dimension="small" />
		{/if}
		{#if focused}
			<Button
				variant="ghost"
				dimension="compact"
				onclick={(e: Event) => {
					e.preventDefault()
					toggleFocus()
				}}><CenterSquare size={16} /></Button
			>
		{/if}
		{#if hidden}
			<Button
				class="show-investment-button"
				variant="ghost"
				dimension="compact"
				onclick={(e: Event) => {
					e.preventDefault()
					toggleHide()
				}}><ViewOff size={16} /></Button
			>
		{:else}
			<div class="dropdown">
				<Dropdown left buttonDimension="compact">
					{#snippet button()}
						<OverflowMenuVertical size={24} />
					{/snippet}
					<List>
						<ListItem onclick={toggleFocus}
							><CenterSquare size={24} />{focused
								? $_('component.investmentCard.removeFocus')
								: $_('component.investmentCard.focusInChart')}</ListItem
						>
						<ListItem onclick={toggleHide}
							><ViewOff size={24} />{$_('component.investmentCard.hideInChart')}</ListItem
						>
						{#if !viewOnly}
							<ListItem onclick={editInvestment}
								><Settings size={24} />{$_(
									'component.investmentCard.editInvestmentDetails',
								)}</ListItem
							>
							<ListItem
								onclick={() => cascadeDuplicateInvestment(investment, investment.portfolio_id)}
								><Copy size={24} />{$_('component.investmentCard.duplicateInvestment')}</ListItem
							>
							<ListItem
								onclick={() => {
									selectedTransactionIdForDeletion = investment.id
									showDeleteInvestmentModal = true
								}}><TrashCan size={24} />{$_('component.investmentCard.deleteInvestment')}</ListItem
							>
						{/if}
					</List>
				</Dropdown>
			</div>
		{/if}
	</Horizontal>
	<div class="trasaction-container" class:modalShow={!open || hidden}>
		<Horizontal>
			{#if openTransaction && !viewOnly}
				<Button
					dimension="compact"
					variant="solid"
					onclick={(e: Event) => {
						e.preventDefault()
						openTransaction(investment)
					}}>{$_('common.addTransaction')}</Button
				>
			{:else}
				<Typography variant="h5">{$_('common.transactions')}</Typography>
			{/if}
			<FlexItem />
			<Badge>{investment.apy}% APY</Badge>
		</Horizontal>
		{#if transactions.length === 0}
			<section class="centered">
				<img src={`${base}/images/no-transaction.svg`} alt={$_('common.noTransactionYet')} />
				<Typography variant="h5">{$_('component.investmentCard.noTransactions')}</Typography>
				{#if !viewOnly}
					<Typography variant="small"
						>{$_('component.investmentCard.noTransactionsText')}</Typography
					>
				{/if}
			</section>
		{:else}
			<Vertical --vertical-gap="0">
				{#each transactions as transaction}
					<Divider --margin="0" />
					<TransactionCard
						{viewOnly}
						{showInflation}
						editTransaction={openTransaction
							? () => openTransaction(investment, transaction)
							: undefined}
						{transaction}
						{portfolio}
						currency={portfolio.currency}
						exhaustionWarning={exhaustionWarning?.transactionIds.includes(transaction.id ?? -1)
							? exhaustionWarning
							: undefined}
						goalName={transaction.id && transactionGoalMap
							? transactionGoalMap.get(transaction.id)
							: undefined}
					/>
				{/each}
			</Vertical>
		{/if}
	</div>
</div>

<DeleteModal
	confirm={() =>
		selectedTransactionIdForDeletion && deleteInvestment(selectedTransactionIdForDeletion)}
	oncancel={() => {
		showDeleteInvestmentModal = false
		selectedTransactionIdForDeletion = undefined
	}}
	bind:open={showDeleteInvestmentModal}
	title={$_('component.editInvestment.deleteInvestmentWarningTitle')}
	text={$_('component.editInvestment.deleteInvestmentWarning')}
/>

<style type="postcss">
	.card {
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		background-color: var(--colors-base);
		padding: var(--padding);
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		cursor: pointer;
		transition: border 0.2s;
		transition-timing-function: ease-in;
		:global(.open-investment-icon) {
			transform: rotate(0deg);
			transition: transform 0.2s ease-out;
		}
		:global(.investment-name) {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
	.dropdown {
		opacity: 1;
		transition: opacity 0.2s ease-out;
		visibility: visible;
	}
	.card:hover {
		border: 1px solid var(--colors-ultra-high);
		transition: border 0.2s;
		transition-timing-function: ease-out;
	}
	.chevron {
		padding: var(--half-padding);
		border: 1px solid transparent;
		display: flex;
	}
	.hidden {
		background-color: var(--colors-low);
		pointer-events: none;
		:global(.open-investment-icon) {
			opacity: 0.25;
		}
		:global(.show-investment-button) {
			pointer-events: all;
		}
		:global(.investment-name) {
			text-decoration: line-through;
		}
		:global(.investment-badge) {
			display: none;
		}
		&:hover {
			border: 1px solid var(--colors-low);
			transition: none;
		}
	}
	.card.open {
		:global(.open-investment-icon) {
			transform: rotate(90deg);
			transition: transform 0.2s ease-out;
		}
	}
	.centered {
		text-align: center;
		img {
			padding-bottom: var(--padding);
		}
	}
	.trasaction-container {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		&.modalShow {
			display: none;
		}
	}
</style>
