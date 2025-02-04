<script lang="ts">
	import type { Transaction } from '$lib/types'
	import {
		ChevronRight,
		Edit,
		Copy,
		TrashCan,
		ViewOff,
		OverflowMenuVertical,
	} from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { formatCurrency } from '$lib/utils'
	import adapter from '$lib/adapters'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import { calculateTotalAmount, calculateNumOccurrences } from '$lib/calc'
	import Dropdown from './ui/dropdown.svelte'
	import List from './ui/list/list.svelte'
	import ListItem from './ui/list/list-item.svelte'
	import { notImplemented } from '$lib/not-implemented'

	type Props = {
		transaction: Transaction
		currency: string
		viewOnly: boolean
		editTransaction?: (transaction: Transaction) => void
	}

	let { transaction, currency, viewOnly, editTransaction }: Props = $props()

	let openTransaction = $state(false)
	let hidden = $state(false)

	const numOccurrences = $derived(
		calculateNumOccurrences(
			transaction.date,
			transaction.end_date,
			transaction.repeat_unit,
			transaction.repeat,
		),
	)

	const totalAmount = $derived(calculateTotalAmount([transaction], transaction.type))
	async function deleteTransaction(e: Event) {
		e.stopPropagation()

		if (!transaction.id) {
			return
		}

		if (confirm($_('Are you sure you want to delete?'))) {
			await adapter.deleteTransaction(transaction)
		}
	}

	async function duplicateTransaction(e: Event) {
		e.stopPropagation()

		if (!transaction.id) {
			return
		}

		const duplicatedTransaction = {
			...transaction,
			id: undefined,
		}
		await adapter.addTransaction(duplicatedTransaction)
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="card"
	onclick={(e: Event) => {
		e.stopPropagation()
		openTransaction = !openTransaction
	}}
	class:openTransaction
	class:hidden
>
	<Horizontal --horizontal-gap="var(--half-padding)">
		<div class="chevron">
			<ChevronRight size={16} class="open-transaction-icon" />
		</div>
		<Typography class={`transaction ${transaction.type === 'deposit' ? 'deposit' : 'withdrawal'}`}>
			{#if transaction.repeat}
				{`${formatCurrency(transaction.amount, currency)} / ${transaction.repeat > 1 ? transaction.repeat + ' ' : ''}${transaction.repeat_unit ? transaction.repeat_unit.substring(0, 1) : ''}`}
			{:else}
				{formatCurrency(transaction.amount, currency)}
			{/if}
		</Typography>
		<FlexItem />
		{#if hidden}
			<Button
				class="show-transaction-button"
				variant="solid"
				dimension="small"
				onclick={(e: Event) => {
					e.stopPropagation()
					hidden = !hidden
				}}
			>
				<ViewOff size={16} />
			</Button>
		{:else}
			<div class="control-buttons">
				<Button
					variant="solid"
					dimension="small"
					onclick={(e: Event) => {
						e.stopPropagation()
						hidden = !hidden
						notImplemented(e)
					}}
				>
					<ViewOff size={16} />
				</Button>
				<div class="dropdown" class:hidden={viewOnly}>
					<Dropdown left buttonDimension="small" buttonVariant="solid">
						{#snippet button()}
							<OverflowMenuVertical size={16} />
						{/snippet}
						<List>
							<ListItem
								dimension="small"
								onclick={(e: Event) => {
									e.stopPropagation()
									editTransaction?.(transaction)
								}}><Edit size={16} />Edit transaction</ListItem
							>
							<ListItem dimension="small" onclick={duplicateTransaction}
								><Copy size={16} />Duplicate transaction</ListItem
							>
							<ListItem dimension="small" onclick={deleteTransaction}
								><TrashCan size={16} />Delete transaction</ListItem
							>
						</List>
					</Dropdown>
				</div>
			</div>
			<Typography variant="small" class="transaction-label">{transaction.label}</Typography>
		{/if}
	</Horizontal>
	<section class="transaction-info" class:modalShow={!openTransaction || hidden}>
		<Typography variant="small"
			>{transaction.date.substring(
				0,
				10,
			)}{`${transaction.end_date ? ' → ' + transaction.end_date.substring(0, 10) : ''}`}</Typography
		>
		{#if transaction.repeat}
			<Typography variant="small">{numOccurrences} occurrences</Typography>
		{/if}
		<Typography variant="small"
			>{totalAmount}
			{currency} total {transaction.type === 'deposit' ? 'deposit' : 'withdrawal'}</Typography
		>
	</section>
</div>

<style type="postcss">
	:root {
		--card-control-opacity: 0.25;
	}
	.card {
		background-color: var(--colors-base);
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		padding: var(--half-padding);
		:global(.open-transaction-icon) {
			transform: rotate(0deg);
			transition: transform 0.2s ease-out;
		}
		&:hover {
			background-color: var(--colors-ultra-low);
			transition: background-color 0.2s ease-out;
			.control-buttons {
				opacity: 1;
				content-visibility: visible;
				animation: fadeInFromNone 0.2s ease-in;
			}
			:global(.transaction-label) {
				display: none;
			}
		}
	}
	.chevron {
		margin: var(--half-padding);
		border: 1px solid transparent;
		display: flex;
	}
	.openTransaction {
		:global(.open-transaction-icon) {
			transform: rotate(90deg);
			transition: transform 0.2s ease-out;
		}
	}
	:global(.deposit) {
		color: var(--colors-high) !important;
		&::before {
			content: '+';
		}
	}
	:global(.withdrawal) {
		color: var(--colors-red) !important;
		&::before {
			content: '-';
		}
	}
	.control-buttons {
		display: flex;
		gap: var(--quarter-padding);
		opacity: var(--card-control-opacity);
		content-visibility: hidden;
	}
	.hidden {
		background-color: transparent;
		pointer-events: none;
		:global(.open-transaction-icon) {
			opacity: 0.25;
		}
		:global(.show-transaction-button) {
			pointer-events: all;
		}
		:global(.transaction) {
			text-decoration: line-through;
		}
		&:hover {
			background-color: transparent;
			transition: none;
		}
	}
	.transaction-info {
		display: flex;
		flex-direction: column;
		padding-left: 42px;
		&.modalShow {
			display: none;
		}
	}
	@keyframes fadeInFromNone {
		0% {
			opacity: var(--card-control-opacity);
		}
		100% {
			opacity: 1;
		}
	}
</style>
