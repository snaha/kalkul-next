<script lang="ts">
	import { transactionStore } from '$lib/stores/transaction.svelte'
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
	}: Props = $props()

	const transactions = $derived(transactionStore.filter(investment.id))
	let openInvestment = $state(false)

	function cardOpenInvestment(e: MouseEvent) {
		if (e.defaultPrevented) {
			return
		}
		toggleInvestment()
	}

	function toggleInvestment() {
		openInvestment = !openInvestment
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
<div class="card" onclick={cardOpenInvestment} class:hidden class:openInvestment>
	<Horizontal --horizontal-gap="var(--quarter-padding)">
		<ChevronRight size={24} class="open-investment-icon" />
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
			<Dropdown left buttonDimension="compact">
				{#snippet button()}
					<OverflowMenuVertical size={16} />
				{/snippet}
				<List>
					<ListItem onclick={toggleFocus}
						><CenterSquare size={24} />{focused
							? $_('Remove focus')
							: $_('Focus in chart')}</ListItem
					>
					<ListItem onclick={toggleHide}><ViewOff size={24} />{$_('Hide in charts')}</ListItem>
					{#if !viewOnly}
						<ListItem onclick={editInvestment}
							><Settings size={24} />{$_('Edit investment details')}</ListItem
						>
						<ListItem onclick={() => cascadeDuplicateInvestment(investment, investment.portfolio)}
							><Copy size={24} />{$_('Duplicate investment')}</ListItem
						>
						<ListItem onclick={() => deleteInvestment(investment.id)}
							><TrashCan size={24} />{$_('Delete investment')}</ListItem
						>
					{/if}
				</List>
			</Dropdown>
		{/if}
	</Horizontal>
	<div class="trasaction-container" class:modalShow={!openInvestment || hidden}>
		<Horizontal>
			<Typography variant="h5">{$_('Transactions')}</Typography>
			<FlexItem />
			{#if openTransaction && !viewOnly}
				<Button
					dimension="compact"
					onclick={(e: Event) => {
						e.preventDefault()
						openTransaction(investment)
					}}><Add size={24} />{$_('Add')}</Button
				>
			{/if}
		</Horizontal>
		{#if transactions.length === 0}
			<section class="centered">
				<img src="/images/no-transaction.svg" alt="No transaction yet" />
				<Typography variant="h5">{$_('No transaction yet')}</Typography>
				{#if !viewOnly}
					<Typography variant="small">{$_('Use the button above to add one')}</Typography>
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
	.card:hover {
		border: 1px solid var(--colors-ultra-high);
		transition: border 0.2s;
		transition-timing-function: ease-out;
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
	.openInvestment {
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
