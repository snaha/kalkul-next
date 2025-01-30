<script lang="ts">
	import type { Transaction } from '$lib/types'
	import { ChevronRight, Edit, Copy, TrashCan, ViewOff } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { formatCurrency } from '$lib/utils'
	import adapter from '$lib/adapters'
	import { notImplemented } from '$lib/not-implemented'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import { calculateTotalAmount, calculateNumOccurrences } from '$lib/calc'

	type Props = {
		transaction: Transaction
		currency: string
		viewOnly: boolean
		editTransaction?: (transaction: Transaction) => void
	}

	let { transaction, currency, viewOnly, editTransaction }: Props = $props()

	let openTransaction = $state(false)

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
		e.preventDefault()
		openTransaction = !openTransaction
	}}
	class:openTransaction
>
	<Horizontal>
		<ChevronRight size={24} class="open-transaction-icon" />
		<Typography>{transaction.label}</Typography>
		<FlexItem />
		<Typography class={transaction.type === 'deposit' ? 'deposit' : 'withdrawal'}>
			{#if transaction.repeat}
				{`${formatCurrency(transaction.amount, currency)} / ${transaction.repeat > 1 ? transaction.repeat + ' ' : ''}${transaction.repeat_unit ? transaction.repeat_unit.substring(0, 1) : ''}`}
			{:else}
				{formatCurrency(transaction.amount, currency)}
			{/if}
		</Typography>
	</Horizontal>
	<section class="transaction-info" class:hidden={!openTransaction}>
		<Typography
			>{transaction.date.substring(
				0,
				10,
			)}{`${transaction.end_date ? ' → ' + transaction.end_date.substring(0, 10) : ''}`}</Typography
		>
		{#if transaction.repeat}
			<Typography>{numOccurrences} occurrences</Typography>
		{/if}
		<Typography
			>{totalAmount}
			{currency} total {transaction.type === 'deposit' ? 'deposit' : 'withdrawal'}</Typography
		>
	</section>
	<section class="transaction-control" class:hidden={!openTransaction || viewOnly}>
		<Button
			variant="solid"
			dimension="small"
			onclick={(e: Event) => {
				e.stopPropagation()
				editTransaction?.(transaction)
			}}
		>
			<Edit size={16} />Edit
		</Button>
		<Button variant="solid" dimension="small" onclick={duplicateTransaction}
			><Copy size={16} />Duplicate</Button
		>
		<Button variant="solid" dimension="small" onclick={notImplemented}><ViewOff size={16} /></Button
		>
		<Button variant="solid" dimension="small" onclick={deleteTransaction}
			><TrashCan size={16} /></Button
		>
	</section>
</div>

<style type="postcss">
	.card {
		background-color: var(--colors-base);
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		:global(.open-transaction-icon) {
			transform: rotate(0deg);
			transition: transform 0.2s ease-out;
		}
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
		color: red !important;
		&::before {
			content: '-';
		}
	}
	.transaction-info {
		display: flex;
		flex-direction: column;
		padding-left: var(--double-padding);
	}
	.transaction-control {
		display: flex;
		padding: var(--half-padding) 0 var(--half-padding) var(--double-padding);
		gap: var(--half-padding);
	}
	.hidden {
		display: none;
	}
</style>
