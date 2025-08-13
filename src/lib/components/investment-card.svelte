<script lang="ts">
	import { cascadeDuplicateInvestment } from '$lib/cascade'
	import type { InvestmentWithColorIndex, Portfolio, Transaction } from '$lib/types'
	import {
		Add,
		CenterSquare,
		ChevronRight,
		Copy,
		OverflowMenuVertical,
		Settings,
		TrashCan,
		ViewOff,
	} from 'carbon-icons-svelte'
	import Badge from './ui/badge.svelte'
	import Button from './ui/button.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import Dropdown from './ui/dropdown.svelte'
	import List from './ui/list/list.svelte'
	import ListItem from './ui/list/list-item.svelte'
	import { SERIES_COLORS } from '$lib/colors'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import Vertical from './ui/vertical.svelte'
	import TransactionCard from './transaction-card.svelte'
	import Divider from './ui/divider.svelte'
	import adapters from '$lib/adapters'
	import { base } from '$app/paths'
	import { transactionStore } from '$lib/stores/transaction.svelte'

	type Props = {
		investment: InvestmentWithColorIndex
		portfolio: Portfolio
		viewOnly?: boolean
		index: number
		hidden: boolean
		focused: boolean
		openTransaction?: (investment: InvestmentWithColorIndex, transaction?: Transaction) => void
		toggleHide: () => void
		toggleFocus: () => void
		open?: boolean
	}

	let {
		investment,
		portfolio,
		viewOnly = false,
		index,
		hidden,
		focused,
		openTransaction,
		toggleHide,
		toggleFocus,
		open = $bindable(false),
	}: Props = $props()

	const transactions = $derived(transactionStore.filter(investment.id))

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
		goto(routes.EDIT_INVESTMENT(portfolio.client, portfolio.id, investment.id))
	}

	async function deleteInvestment(investmentId: number) {
		await adapters.deleteInvestment({ id: investmentId })
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
			<ChevronRight size={24} class="open-investment-icon" />
		</div>
		<div class="color-box" style={`background-color: ${SERIES_COLORS[index]}`}></div>
		<Typography variant="h5">{investment.name}</Typography>
		<Badge>{investment.apy}%</Badge>
		<FlexItem />
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
						<OverflowMenuVertical size={16} />
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
							<ListItem onclick={() => deleteInvestment(investment.id)}
								><TrashCan size={24} />{$_('component.investmentCard.deleteInvestment')}</ListItem
							>
						{/if}
					</List>
				</Dropdown>
			</div>
		{/if}
	</Horizontal>
	<div class="trasaction-container" class:modalShow={!open || hidden}>
		<Horizontal>
			<Typography variant="h5">{$_('common.transactions')}</Typography>
			<FlexItem />
			{#if openTransaction && !viewOnly}
				<Button
					dimension="compact"
					onclick={(e: Event) => {
						e.preventDefault()
						openTransaction(investment)
					}}><Add size={24} />{$_('common.add')}</Button
				>
			{/if}
		</Horizontal>
		{#if transactions.length === 0}
			<section class="centered">
				<img src={`${base}/images/no-transaction.svg`} alt="No transaction yet" />
				<Typography variant="h5">{$_('component.investmentCard.noTransactionsYet')}</Typography>
				{#if !viewOnly}
					<Typography variant="small"
						>{$_('component.investmentCard.noTransactionsYetText')}</Typography
					>
				{/if}
			</section>
		{:else}
			<Vertical --vertical-gap="0">
				{#each transactions as transaction}
					<Divider --margin="0" />
					<TransactionCard
						{viewOnly}
						editTransaction={openTransaction
							? () => openTransaction(investment, transaction)
							: undefined}
						{transaction}
						currency={portfolio.currency}
					/>
				{/each}
			</Vertical>
		{/if}
	</div>
</div>

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
	}
	.dropdown {
		opacity: 0;
		transition: opacity 0.2s ease-in;
		visibility: hidden;
	}
	.card:hover {
		border: 1px solid var(--colors-ultra-high);
		transition: border 0.2s;
		transition-timing-function: ease-out;
		.dropdown {
			opacity: 1;
			transition: opacity 0.2s ease-out;
			visibility: visible;
		}
	}
	.chevron {
		padding: var(--half-padding);
		border: 1px solid transparent;
		display: flex;
	}
	.color-box {
		width: 36px;
		height: 24px;
		border-radius: var(--border-radius);
	}
	.hidden {
		background-color: transparent;
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
