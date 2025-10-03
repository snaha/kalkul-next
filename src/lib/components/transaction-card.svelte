<script lang="ts">
	import type { Transaction, Portfolio } from '$lib/types'
	import { ChevronRight, Edit, Copy, TrashCan, OverflowMenuVertical } from 'carbon-icons-svelte'
	import Typography from './ui/typography.svelte'
	import { _, locale } from 'svelte-i18n'
	import { formatCurrency } from '$lib/utils'
	import adapter from '$lib/adapters'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import {
		calculateTotalDisplayAmount,
		calculateNumOccurrences,
		type Period,
	} from '$lib/@snaha/kalkul-maths'
	import Dropdown from './ui/dropdown.svelte'
	import List from './ui/list/list.svelte'
	import ListItem from './ui/list/list-item.svelte'
	import InflationBadge from './inflation-badge.svelte'

	type Props = {
		transaction: Transaction
		portfolio: Portfolio
		currency: string
		viewOnly: boolean
		showInflation?: boolean
		editTransaction?: (transaction: Transaction) => void
	}

	let {
		transaction,
		portfolio,
		currency,
		viewOnly,
		showInflation = false,
		editTransaction,
	}: Props = $props()

	let openTransaction = $state(false)

	const numOccurrences = $derived(calculateNumOccurrences(transaction))

	const totalAmounts = $derived(
		calculateTotalDisplayAmount(
			[transaction],
			transaction.type,
			portfolio.inflation_rate,
			portfolio.start_date,
		),
	)
	const totalAmount = $derived(showInflation ? totalAmounts.adjusted : totalAmounts.nominal)
	async function deleteTransaction(e: Event) {
		e.stopPropagation()

		if (!transaction.id) {
			return
		}

		if (confirm($_('component.transactionCard.deleteWarning'))) {
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

	function localisedAbbreviatedPeriod(period: Period) {
		switch (period) {
			case 'year':
				return $_('common.abbreviations.year')
			case 'month':
				return $_('common.abbreviations.month')
			case 'week':
				return $_('common.abbreviations.week')
			case 'day':
				return $_('common.abbreviations.day')
		}
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
>
	<Horizontal --horizontal-gap="var(--half-padding)">
		<div class="chevron">
			<ChevronRight size={16} class="open-transaction-icon" />
		</div>
		<Typography class={`transaction ${transaction.type === 'deposit' ? 'deposit' : 'withdrawal'}`}>
			{#if transaction.repeat}
				{`${formatCurrency(transaction.amount, currency, $locale)} / ${transaction.repeat > 1 ? transaction.repeat + ' ' : ''}${transaction.repeat_unit ? localisedAbbreviatedPeriod(transaction.repeat_unit) : ''}`}
			{:else}
				{formatCurrency(transaction.amount, currency, $locale)}
			{/if}
		</Typography>
		{#if transaction.inflation_adjusted && !openTransaction}
			<InflationBadge />
		{/if}

		<FlexItem />
		{#if transaction.label}
			<Typography variant="small" class="transaction-label {viewOnly ? 'view-only' : ''}"
				>{transaction.label}</Typography
			>
		{/if}
		<div class="control-buttons">
			{#if !viewOnly}
				<div class="dropdown">
					<Dropdown left buttonDimension="small" buttonVariant="solid" stopPropagation>
						{#snippet button()}
							<OverflowMenuVertical size={16} />
						{/snippet}
						<List>
							<ListItem
								dimension="small"
								onclick={(e: Event) => {
									e.stopPropagation()
									editTransaction?.(transaction)
								}}><Edit size={16} />{$_('component.viewHeader.editTransaction')}</ListItem
							>
							<ListItem dimension="small" onclick={duplicateTransaction}
								><Copy size={16} />{$_('component.viewHeader.duplicateTransaction')}</ListItem
							>
							<ListItem dimension="small" onclick={deleteTransaction}
								><TrashCan size={16} />{$_('component.viewHeader.deleteTransaction')}</ListItem
							>
						</List>
					</Dropdown>
				</div>
			{/if}
		</div>
	</Horizontal>
	<section class="transaction-info" class:modalShow={!openTransaction}>
		{#if transaction.inflation_adjusted}
			<InflationBadge>{$_('common.inflationAdjusted')}</InflationBadge>
		{/if}

		<Typography variant="small"
			>{transaction.date.substring(
				0,
				10,
			)}{`${transaction.end_date ? ' → ' + transaction.end_date.substring(0, 10) : ''}`}</Typography
		>

		{#if !transaction.repeat}
			<!-- Single transaction -->
			{#if transaction.inflation_adjusted}
				<!-- Inflation-adjusted: show both real and nominal values -->
				{#if showInflation}
					<!-- Show inflation ON: real value primary, nominal value secondary -->
					<Typography variant="small" class="total-amount">
						{$_('common.realValue')}: {formatCurrency(totalAmounts.adjusted, currency, $locale)}
					</Typography>
					<Typography variant="small" class="total-amount secondary">
						{$_('common.nominalValue')}: {formatCurrency(totalAmounts.nominal, currency, $locale)}
					</Typography>
				{:else}
					<!-- Show inflation OFF: nominal value primary, real value secondary -->
					<Typography variant="small" class="total-amount">
						{$_('common.nominalValue')}: {formatCurrency(totalAmounts.nominal, currency, $locale)}
					</Typography>
					<Typography variant="small" class="total-amount secondary">
						{$_('common.realValue')}: {formatCurrency(totalAmounts.adjusted, currency, $locale)}
					</Typography>
				{/if}
			{:else if showInflation}
				<!-- Not inflation-adjusted, show inflation ON: display real and nominal values -->
				<Typography variant="small" class="total-amount">
					{$_('common.realValue')}: {formatCurrency(totalAmounts.adjusted, currency, $locale)}
				</Typography>
				<Typography variant="small" class="total-amount secondary">
					{$_('common.nominalValue')}: {formatCurrency(totalAmounts.nominal, currency, $locale)}
				</Typography>
			{/if}
			<!-- Not inflation-adjusted, show inflation OFF: display only date -->
		{:else}
			<!-- Recurring transaction -->
			<Typography variant="small"
				>{numOccurrences} {$_('component.editTransaction.occurrences')}</Typography
			>
			{#if transaction.inflation_adjusted}
				<!-- Inflation-adjusted: show both total real and total nominal values -->
				{#if showInflation}
					<!-- Show inflation ON: total real primary, total nominal secondary -->
					<Typography variant="small" class="total-amount">
						{$_('common.totalReal')}: {formatCurrency(totalAmounts.adjusted, currency, $locale)}
					</Typography>
					<Typography variant="small" class="total-amount secondary">
						{$_('common.totalNominal')}: {formatCurrency(totalAmounts.nominal, currency, $locale)}
					</Typography>
				{:else}
					<!-- Show inflation OFF: total nominal primary, total real secondary -->
					<Typography variant="small" class="total-amount">
						{$_('common.totalNominal')}: {formatCurrency(totalAmounts.nominal, currency, $locale)}
					</Typography>
					<Typography variant="small" class="total-amount secondary">
						{$_('common.totalReal')}: {formatCurrency(totalAmounts.adjusted, currency, $locale)}
					</Typography>
				{/if}
			{:else if showInflation}
				<!-- Not inflation-adjusted, show inflation ON: display total real and total nominal -->
				<Typography variant="small" class="total-amount">
					{$_('common.totalReal')}: {formatCurrency(totalAmounts.adjusted, currency, $locale)}
				</Typography>
				<Typography variant="small" class="total-amount secondary">
					{$_('common.totalNominal')}: {formatCurrency(totalAmounts.nominal, currency, $locale)}
				</Typography>
			{:else}
				<!-- Not inflation-adjusted, show inflation OFF: display total deposited/withdrawn -->
				<Typography variant="small" class="total-amount">
					{transaction.type === 'deposit'
						? $_('component.viewHeader.totalDeposited', {
								values: { amount: formatCurrency(totalAmount, currency, $locale) },
							})
						: $_('component.viewHeader.totalWithdrawn', {
								values: { amount: formatCurrency(totalAmount, currency, $locale) },
							})}
				</Typography>
			{/if}
		{/if}
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
		:global(.transaction-label) {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			visibility: visible;
		}
		&:hover {
			background-color: var(--colors-ultra-low);
			transition: background-color 0.2s ease-out;
			.control-buttons {
				display: flex;
				opacity: 1;
				visibility: visible;
				animation: fadeInFromNone 0.2s ease-in;
			}
			:global(.transaction-label) {
				display: none;
			}
			:global(.transaction-label.view-only) {
				display: flex;
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
	:global(.transaction) {
		white-space: nowrap;
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
		display: none;
		position: relative;
		right: 0;
	}
	.transaction-info {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--quarter-padding);
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
	:global(.total-amount) {
		color: var(--colors-high);
	}
	:global(.total-amount.secondary) {
		color: var(--colors-ultra-high);
		opacity: 0.5;
	}
</style>
