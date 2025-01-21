<script lang="ts">
	import type { Transaction } from '$lib/types'
	import {
		Copy,
		OverflowMenuVertical,
		SettingsEdit,
		TrashCan,
		ViewFilled,
	} from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { formatCurrency, formatDate, formatNumber } from '$lib/utils'
	import Dropdown from './ui/dropdown.svelte'
	import adapter from '$lib/adapters'
	import { notImplemented } from '$lib/not-implemented'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import { calculateTotalAmount, numOccurrences } from '$lib/calc'

	type Props = {
		transaction: Transaction
		currency: string
		open: (Transaction: Transaction) => void
	}

	let { transaction, currency, open }: Props = $props()

	const numOccurences = $derived(
		numOccurrences(
			transaction.date,
			transaction.end_date ?? transaction.date,
			transaction.repeat_unit ?? 'month',
			transaction.repeat ?? 1,
		),
	)
	const totalAmount = $derived(calculateTotalAmount([transaction], transaction.type))

	function pluralize(word: string, count: number) {
		if (count < 2) {
			return word
		}
		// TODO localize for other languages
		return word + 's'
	}

	function openTransaction(e: MouseEvent) {
		if (e.defaultPrevented) {
			return
		}
		open(transaction)
	}

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
<div class="card" onclick={openTransaction}>
	<Horizontal>
		<Typography bold>
			{#if transaction.repeat}
				{`${formatCurrency(transaction.amount, currency)}, every ${transaction.repeat > 1 ? transaction.repeat + ' ' : ''}${pluralize(transaction.repeat_unit || '', transaction.repeat)}`}
			{:else}
				{formatCurrency(transaction.amount, currency)}
			{/if}
		</Typography>
		<FlexItem />
		<Dropdown buttonDimension="compact" left>
			{#snippet button()}
				<OverflowMenuVertical size={16} />
			{/snippet}
			<ul class="dropdown-menu">
				<Button variant="ghost" dimension="compact" leftAlign onclick={notImplemented}
					><ViewFilled size={24} />{$_('Show in charts')}</Button
				>
				<Button variant="ghost" dimension="compact" leftAlign onclick={openTransaction}
					><SettingsEdit size={24} />{transaction.type === 'deposit'
						? $_('Edit deposit details')
						: $_('Edit withdrawal details')}</Button
				>
				<Button variant="ghost" dimension="compact" leftAlign onclick={duplicateTransaction}
					><Copy size={24} />{transaction.type === 'deposit'
						? $_('Duplicate deposit')
						: $_('Duplicate withdrawal')}</Button
				>
				<Button variant="ghost" dimension="compact" leftAlign onclick={deleteTransaction}
					><TrashCan size={24} />{transaction.type === 'deposit'
						? $_('Delete deposit')
						: $_('Delete withdrawal')}</Button
				>
			</ul>
		</Dropdown>
	</Horizontal>
	<div class="info">
		<Typography>{transaction.label}</Typography>
		<Typography
			>{formatDate(new Date(transaction.date))}
			{#if transaction.end_date}
				{` → ` + formatDate(new Date(transaction.end_date))}
			{/if}
		</Typography>
		{#if transaction.end_date}
			<Typography>
				{formatNumber(numOccurences, { useGrouping: true })}
				{$_('occurences')}
			</Typography>
			<Typography>
				{formatCurrency(totalAmount, currency)}
				{transaction.type === 'deposit' ? $_('total deposits') : $_('total withdrawals')}
			</Typography>
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
		gap: var(--half-padding);
		cursor: pointer;
		transition: border 0.2s;
		transition-timing-function: ease-in;
	}
	.card:hover {
		border: 1px solid var(--colors-ultra-high);
		transition: border 0.2s;
		transition-timing-function: ease-out;
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	.dropdown-menu {
		display: flex;
		flex-direction: column;
		width: auto;
		margin: 0;
		padding: var(--padding);
		gap: 0;
		background-color: var(--colors-base);
		border-radius: var(--quarter-padding);
		border: solid 1px var(--colors-low);
	}
</style>
