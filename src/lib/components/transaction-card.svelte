<script lang="ts">
	import type { Transaction } from '$lib/types'
	import { OverflowMenuVertical } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { formatCurrency, formatDate, formatNumber, month } from '$lib/utils'

	type Props = {
		transaction: Transaction
		currency: string
		open: (Transaction: Transaction) => void
	}

	let { transaction, currency, open }: Props = $props()

	const numOccurences = $derived(
		Math.floor(
			(new Date(transaction.end_date || transaction.date).getTime() -
				new Date(transaction.date).getTime()) /
				month,
		),
	)
	const totalAmount = $derived(numOccurences * Number(transaction.amount))

	function pluralize(word: string, count: number) {
		if (count < 2) {
			return word
		}
		// TODO localize for other languages
		return word + 's'
	}

	function openTransaction() {
		open(transaction)
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" onclick={openTransaction}>
	<div class="title">
		<Typography font="mono">
			{#if transaction.repeat}
				{`${formatCurrency(transaction.amount, currency)}, every ${transaction.repeat > 1 ? transaction.repeat + ' ' : ''}${pluralize(transaction.repeat_unit || '', transaction.repeat)}`}
			{:else}
				{formatCurrency(transaction.amount, currency)}
			{/if}
		</Typography>
		<div class="grower"></div>
		<Button variant="ghost" dimension="compact"><OverflowMenuVertical size={16} /></Button>
	</div>
	<div class="info">
		<Typography variant="small">{transaction.label}</Typography>
		<Typography variant="small"
			>{formatDate(new Date(transaction.date))}
			{#if transaction.end_date}
				{` → ` + formatDate(new Date(transaction.end_date))}
			{/if}
		</Typography>
		{#if transaction.end_date}
			<Typography variant="small">
				{formatNumber(numOccurences, { useGrouping: true })}
				{$_('occurences')}
			</Typography>
			<Typography variant="small">
				{formatCurrency(totalAmount, currency)}
				({transaction.type === 'deposit' ? $_('total deposits') : $_('total withdrawals')})
			</Typography>
		{/if}
	</div>
</div>

<style type="postcss">
	.card {
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		background-color: var(--colors-base);
		padding: var(--half-padding);
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		cursor: pointer;
	}
	.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--quarter-padding);
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: var(--quarter-padding);
	}
</style>
