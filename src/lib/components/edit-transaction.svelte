<script lang="ts">
	import { Close, Checkmark, TrashCan } from 'carbon-icons-svelte'
	import { _, locale } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import FormattedNumberInput from '$lib/components/ui/input/formatted-number/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { type Client, type Investment, type Portfolio, type Transaction } from '$lib/types'
	import { type Period, type TransactionType } from '$lib/@snaha/kalkul-maths'
	import adapter from '$lib/adapters'
	import Select from '$lib/components/ui/select/select.svelte'
	import { capitalizeFirstLetter, formatCurrency, formatDate } from '$lib/utils'
	import DateAge from './date-age.svelte'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import Toggle from './ui/toggle.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import {
		addDays,
		addWeeks,
		addMonths,
		addYears,
		differenceInDays,
		differenceInWeeks,
		differenceInMonths,
		differenceInYears,
		subDays,
	} from 'date-fns'
	import FlexItem from './ui/flex-item.svelte'
	import Vertical from './ui/vertical.svelte'
	import { calculateNumOccurrences } from '$lib/@snaha/kalkul-maths'

	type Props = {
		investment: Investment
		portfolio: Portfolio
		client: Client
		transaction?: Transaction
		close: () => void
	}

	let { investment, portfolio, client, transaction, close }: Props = $props()

	let transactionType: TransactionType = $state('deposit')
	let label = $state(
		capitalizeFirstLetter($_('common.deposit')) +
			' ' +
			(investmentStore.filter(investment.id).length + 1).toString(),
	)
	let isDefaultLabel = $state(true)
	let amount = $state<number | undefined>(undefined)
	let date = $state(new Date())
	let isRecurring = $state(false)
	let repeat = $state(1)
	let repeatUnit: Period = $state('month')
	let endDate = $state(new Date())
	let period = $state(30)
	let periodUnit: Period = $state('year')
	const numOccurrences = $derived(
		calculateNumOccurrences({
			date: formatDate(date),
			end_date: formatDate(endDate),
			repeat_unit: repeatUnit,
			repeat,
		}),
	)
	const totalAmount = $derived(amount !== undefined ? numOccurrences * amount : 0)
	const createDisabled = $derived(
		label === '' || amount === undefined || amount <= 0 || (isRecurring && totalAmount === 0),
	)
	const formType = $derived(transaction ? 'edit' : 'create')

	$effect(() => {
		if (transaction) {
			transactionType = transaction.type
			label = transaction.label ?? ''
			amount = transaction.amount
			date = new Date(transaction.date)
			isRecurring = transaction.end_date !== null
			repeat = transaction.repeat ? transaction.repeat : 1
			repeatUnit = transactionRepeatUnit(transaction)
			endDate = transaction.end_date ? new Date(transaction.end_date) : new Date()
			period = transactionPeriod(transaction)
			periodUnit = transactionPeriodUnit(transaction)
		}
	})

	async function createTransaction() {
		if (!authStore.user || amount === undefined || amount <= 0) {
			return
		}
		await adapter.addTransaction({
			investment_id: investment.id,
			type: transactionType,
			amount,
			label,
			date: date.toDateString(),
			repeat: isRecurring ? repeat : null,
			repeat_unit: isRecurring ? repeatUnit : null,
			end_date: isRecurring ? endDate.toDateString() : null,
		})
		close()
	}

	async function editTransaction() {
		if (!transaction || amount === undefined || amount <= 0) {
			return
		}
		await adapter.updateTransaction({
			id: transaction.id,
			investment_id: investment.id,
			type: transactionType,
			amount,
			label,
			date: date.toDateString(),
			repeat: isRecurring ? repeat : null,
			repeat_unit: isRecurring ? repeatUnit : null,
			end_date: isRecurring ? endDate.toDateString() : null,
		})
		close()
	}

	async function deleteTransaction() {
		if (!transaction) {
			return
		}

		if (confirm($_('component.editTransaction.deleteConfirmWarning'))) {
			await adapter.deleteTransaction(transaction)
			close()
		}
	}

	function cancel(event: Event) {
		// FIXME: not sure why this is needed here, but it won't work without it
		event.preventDefault()
		close()
	}

	function addDateFunction(unit: Period) {
		switch (unit) {
			case 'day':
				return addDays
			case 'week':
				return addWeeks
			case 'month':
				return addMonths
			case 'year':
				return addYears
		}
	}

	function dateDifferenceFunction(unit: Period) {
		switch (unit) {
			case 'day':
				return differenceInDays
			case 'week':
				return differenceInWeeks
			case 'month':
				return differenceInMonths
			case 'year':
				return differenceInYears
		}
	}

	function transactionRepeatUnit(t: typeof transaction): Period {
		return t && t.repeat_unit ? t.repeat_unit : 'month'
	}

	function transactionPeriod(t: typeof transaction) {
		if (!t || !t.id || !t.end_date) {
			return 30
		}

		return dateDifferenceFunction(transactionRepeatUnit(t))(t.end_date, t.date) + 1
	}

	function transactionPeriodUnit(t: typeof transaction): Period {
		if (!t || !t.id || !t.end_date) {
			return 'year'
		}

		return transactionRepeatUnit(t)
	}

	function onDateChange() {
		recalculateEndDate()
	}

	function onEndDateChange() {
		recalculatePeriod()
	}

	function onPeriodChange() {
		if (!period || period <= 0) {
			return
		}
		recalculateEndDate()
	}

	function onPeriodUnitChange() {
		recalculateEndDate()
	}

	function recalculatePeriod() {
		const dateDiff = dateDifferenceFunction(periodUnit)
		period = dateDiff(new Date(formatDate(endDate)), new Date(formatDate(date))) + 1
	}

	function recalculateEndDate() {
		const addDate = addDateFunction(periodUnit)
		endDate = subDays(addDate(date, period), 1)
	}

	function checkPeriodInput() {
		if (!period || period <= 0) {
			recalculatePeriod()
		}
	}

	function toggleRecurring() {
		recalculateEndDate()
	}

	function onTransactionTypeChange() {
		if (isDefaultLabel) {
			const labelText =
				transactionType === 'deposit' ? $_('common.deposit') : $_('common.withdrawal')
			label =
				capitalizeFirstLetter(labelText) +
				' ' +
				(investmentStore.filter(investment.id).length + 1).toString()
		}
	}

	function onLabelInput() {
		isDefaultLabel = false
	}
</script>

<Vertical --gap="var(--half-padding)">
	<section class="horizontal">
		<Typography variant="h5"
			>{formType === 'create'
				? $_('component.editTransaction.addTransaction')
				: $_('component.editTransaction.editTransaction')}</Typography
		>
		<FlexItem />
		<Button dimension="compact" variant="ghost" onclick={cancel}><Close size={24} /></Button>
	</section>
	<div class="spacer"></div>
	<div class="horizontal flex-end">
		<Select
			variant="solid"
			dimension="compact"
			bind:value={transactionType}
			label={$_('common.type')}
			items={[
				{ value: 'deposit', label: capitalizeFirstLetter($_('common.deposit')) },
				{ value: 'withdrawal', label: capitalizeFirstLetter($_('common.withdrawal')) },
			]}
			onchange={onTransactionTypeChange}
		></Select>
		<Toggle
			class="toggle"
			dimension="compact"
			label={$_('common.recurring')}
			bind:checked={isRecurring}
			onchange={toggleRecurring}
		></Toggle>
	</div>
	<FormattedNumberInput
		variant="solid"
		dimension="compact"
		placeholder={'0'}
		label={$_('common.amount')}
		unit={portfolio.currency}
		bind:value={amount}
		min={0}
		step={1}
		class="grower"
		locale={$locale}
	></FormattedNumberInput>
	<Input
		dimension="compact"
		variant="solid"
		placeholder={$_('common.label')}
		label={$_('common.label')}
		bind:value={label}
		oninput={onLabelInput}
	></Input>
	<DateAge
		dimension="compact"
		dateInputLabel={$_('common.startDate')}
		ageLabel={$_('component.editTransaction.clientAgeAtStart')}
		agePlaceholder={'0'}
		bind:date
		birthDate={new Date(client.birth_date)}
		onchange={onDateChange}
	></DateAge>
	{#if isRecurring}
		<section class="horizontal inputs">
			<FormattedNumberInput
				variant="solid"
				dimension="compact"
				placeholder={'1'}
				label={$_('component.editTransaction.repeatLabel')}
				min={1}
				step={1}
				bind:value={repeat}
				style="max-width: 100%"
				locale={$locale}
			></FormattedNumberInput>
			<Select
				variant="solid"
				dimension="compact"
				bind:value={repeatUnit}
				items={[
					{ value: 'day', label: $_('common.day').toLowerCase() },
					{ value: 'week', label: $_('common.week').toLowerCase() },
					{ value: 'month', label: $_('common.month').toLowerCase() },
					{ value: 'year', label: $_('common.year').toLowerCase() },
				]}
			></Select>
		</section>
		<section class="horizontal inputs">
			<FormattedNumberInput
				variant="solid"
				dimension="compact"
				placeholder={'30'}
				label={$_('component.editTransaction.for')}
				min={1}
				step={1}
				bind:value={period}
				style="max-width: 100%"
				oninput={onPeriodChange}
				onblur={checkPeriodInput}
				locale={$locale}
			></FormattedNumberInput>
			<Select
				variant="solid"
				dimension="compact"
				bind:value={periodUnit}
				onchange={onPeriodUnitChange}
				items={[
					{ value: 'day', label: $_('common.day').toLowerCase() },
					{ value: 'week', label: $_('common.week').toLowerCase() },
					{ value: 'month', label: $_('common.month').toLowerCase() },
					{ value: 'year', label: $_('common.year').toLowerCase() },
				]}
			></Select>
		</section>
		<DateAge
			dimension="compact"
			dateInputLabel={$_('common.endDate')}
			ageLabel={$_('component.editTransaction.clientAgeAtEnd')}
			agePlaceholder={'0'}
			bind:date={endDate}
			birthDate={new Date(client.birth_date)}
			onchange={onEndDateChange}
		></DateAge>
		<div class="spacer"></div>
		<Vertical --vertical-gap="var(--quarter-padding)">
			<Typography>{numOccurrences} {$_('component.editTransaction.occurrences')}</Typography>
			<Typography
				>{formatCurrency(totalAmount, portfolio.currency, $locale)} ({transactionType === 'deposit'
					? $_('component.editTransaction.totalDeposits')
					: $_('component.editTransaction.totalWithdrawals')})</Typography
			>
		</Vertical>
	{/if}
	<div class="spacer"></div>
	<menu class="buttons horizontal">
		{#if formType === 'create'}
			<Button
				variant="strong"
				dimension="compact"
				onclick={createTransaction}
				disabled={createDisabled}><Checkmark size={16} />{$_('common.create')}</Button
			>
		{:else}
			<Button
				variant="strong"
				dimension="compact"
				onclick={editTransaction}
				disabled={createDisabled}><Checkmark size={16} />{$_('common.done')}</Button
			>
		{/if}
		<Button variant="secondary" dimension="compact" onclick={cancel}
			><Close size={16} />{$_('common.cancel')}</Button
		>
	</menu>
	{#if formType === 'edit'}
		<Button variant="ghost" dimension="compact" onclick={deleteTransaction}
			><TrashCan size={16} />{$_('component.editTransaction.deleteTransaction')}</Button
		>
	{/if}
</Vertical>

<style type="postcss">
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: stretch;
		align-items: center;
		gap: var(--half-padding);
	}
	.flex-end {
		align-items: flex-end;
		:global(.toggle) {
			border: 1px solid transparent;
		}
	}
	.horizontal :global(.grower) {
		flex: 1;
	}
	.inputs {
		align-items: flex-end;
	}
	.horizontal :global(.root) {
		max-width: calc(50% - var(--quarter-padding));
	}
	:global(.max-width-half) {
		max-width: calc(50% - var(--quarter-padding));
	}
	.buttons {
		gap: var(--half-padding);
		margin: 0;
		padding: 0;
		flex: 1;
	}
	:global(.buttons > span) {
		flex-grow: 1 !important;
	}
	.spacer {
	}
</style>
