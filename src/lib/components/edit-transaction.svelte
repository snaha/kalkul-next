<script lang="ts">
	import { Close, Checkmark, TrashCan } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import {
		type TimeUnit,
		type Client,
		type Investment,
		type Portfolio,
		type Transaction,
		type TransactionType,
	} from '$lib/types'
	import adapter from '$lib/adapters'
	import Select from '$lib/components/ui/select/select.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
	import { capitalizeFirstLetter, formatCurrency } from '$lib/utils'
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
	} from 'date-fns'

	type Props = {
		investment: Investment
		portfolio: Portfolio
		client: Client
		transaction: Transaction | { type: TransactionType; id?: never }
		close: () => void
	}

	let { investment, portfolio, client, transaction, close }: Props = $props()

	let label = $state('')
	let amount = $state(0)
	let date = $state(new Date())
	let isRecurring = $state(false)
	let repeat = $state(1)
	let repeatUnit: TimeUnit = $state('month')
	let endDate = $state(new Date())
	let period = $state(30)
	let periodUnit: TimeUnit = $state('year')
	const numOccurences = $derived(dateDifferenceFunction(repeatUnit)(endDate, date))
	const totalAmount = $derived(numOccurences * Number(amount))
	const createDisabled = $derived(
		label === '' || amount === 0 || (isRecurring && totalAmount === 0),
	)
	const formType = $derived(transaction.id ? 'edit' : 'create')

	$effect(() => {
		label =
			transaction.id && transaction.label
				? transaction.label
				: capitalizeFirstLetter($_(transaction.type)) +
					' ' +
					(investmentStore.filter(investment.id).length + 1).toString()
		amount = transaction.id ? transaction.amount : 0
		date = transaction.id ? new Date(transaction.date) : new Date()
		isRecurring = transaction.id ? transaction.end_date !== null : false
		repeat = transaction.id && transaction.repeat ? transaction.repeat : 1
		repeatUnit = transactionRepeatUnit(transaction)
		endDate = transaction.id && transaction.end_date ? new Date(transaction.end_date) : new Date()
		period = transactionPeriod(transaction)
		periodUnit = transactionPeriodUnit(transaction)
	})

	async function createTransaction() {
		if (!authStore.user) {
			return
		}
		await adapter.addTransaction({
			user_id: authStore.user?.id,
			investment_id: investment.id,
			type: transaction.type,
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
		if (!transaction.id) {
			return
		}
		await adapter.updateTransaction({
			id: transaction.id,
			user_id: authStore.user?.id,
			investment_id: investment.id,
			type: transaction.type,
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
		if (!transaction.id) {
			return
		}

		if (confirm('Are you sure you want to delete?')) {
			await adapter.deleteTransaction(transaction)
			close()
		}
	}

	function cancel(event: Event) {
		// FIXME: not sure why this is needed here, but it won't work without it
		event.preventDefault()
		close()
	}

	function addDateFunction(unit: TimeUnit) {
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

	function dateDifferenceFunction(unit: TimeUnit) {
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

	function transactionRepeatUnit(t: typeof transaction): TimeUnit {
		return t.id && t.repeat_unit ? (t.repeat_unit as TimeUnit) : 'month'
	}

	function transactionPeriod(t: typeof transaction) {
		if (!t.id || !t.end_date) {
			return 30
		}

		return dateDifferenceFunction(transactionRepeatUnit(t))(t.end_date, t.date)
	}

	function transactionPeriodUnit(t: typeof transaction): TimeUnit {
		if (!t.id || !t.end_date) {
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
		recalculateEndDate()
	}

	function onPeriodUnitChange() {
		recalculatePeriod()
	}

	function recalculatePeriod() {
		const dateDiff = dateDifferenceFunction(periodUnit)
		period = dateDiff(endDate, date)
	}

	function recalculateEndDate() {
		const addDate = addDateFunction(periodUnit)
		endDate = addDate(date, period)
	}

	function toggleRecurring() {
		recalculateEndDate()
	}
</script>

<form class="vertical">
	<section class="horizontal">
		<Typography variant="h5"
			>{$_(transaction.type === 'deposit' ? 'Add deposit' : 'Add withdrawal')}</Typography
		>
	</section>
	<div class="spacer"></div>
	<Input
		dimension="small"
		variant="solid"
		placeholder={$_('Label')}
		label={$_('Label')}
		bind:value={label}
	></Input>
	<Input
		type="number"
		variant="solid"
		dimension="small"
		placeholder={'0'}
		label={$_(transaction.type == 'deposit' ? 'Deposit amount' : 'Withdrawal amount')}
		unit={portfolio.currency}
		bind:value={amount}
		min={0}
		step={1}
		class="grower"
	></Input>
	<Toggle
		dimension="small"
		label={$_(transaction.type === 'deposit' ? 'Recurring deposit' : 'Recurring withdrawal')}
		bind:checked={isRecurring}
		onchange={toggleRecurring}
	></Toggle>
	<DateAge
		dimension="small"
		dateInputLabel={$_(transaction.type === 'deposit' ? 'Deposit date' : 'Withdrawal date')}
		ageLabel={$_(transaction.type === 'deposit' ? 'Age at deposit' : 'Age at withdrawal')}
		agePlaceholder={'0'}
		bind:date
		birthDate={new Date(client.birth_date)}
		onchange={onDateChange}
	></DateAge>
	{#if isRecurring}
		<section class="horizontal inputs">
			<Input
				type="number"
				variant="solid"
				dimension="small"
				placeholder={'1'}
				label={$_('Repeats every')}
				min={1}
				step={1}
				bind:value={repeat}
				style="max-width: 100%"
			></Input>
			<Select variant="solid" dimension="small" bind:value={repeatUnit}>
				<Option value="day">{$_('day')}</Option>
				<Option value="week">{$_('week')}</Option>
				<Option value="month">{$_('month')}</Option>
				<Option value="year">{$_('year')}</Option>
			</Select>
		</section>
		<section class="horizontal inputs">
			<Input
				type="number"
				variant="solid"
				dimension="small"
				placeholder={'30'}
				label={$_('For')}
				min={1}
				step={1}
				bind:value={period}
				style="max-width: 100%"
				oninput={onPeriodChange}
			></Input>
			<Select
				variant="solid"
				dimension="small"
				bind:value={periodUnit}
				onchange={onPeriodUnitChange}
			>
				<Option value="day">{$_('day')}</Option>
				<Option value="week">{$_('week')}</Option>
				<Option value="month">{$_('month')}</Option>
				<Option value="year">{$_('year')}</Option>
			</Select>
		</section>
		<DateAge
			dimension="small"
			dateInputLabel={$_('End date')}
			ageLabel={$_('Age at end')}
			agePlaceholder={'0'}
			bind:date={endDate}
			birthDate={new Date(client.birth_date)}
			onchange={onEndDateChange}
		></DateAge>
		<div class="spacer"></div>
		<section class="summary vertical">
			<Typography font="mono" variant="small">{numOccurences} {$_('occurences')}</Typography>
			<Typography font="mono" variant="small"
				>{formatCurrency(totalAmount, portfolio.currency)} ({transaction.type === 'deposit'
					? $_('total deposits')
					: $_('total withdrawals')})</Typography
			>
		</section>
	{/if}
	<div class="spacer"></div>
	<menu class="buttons horizontal">
		{#if formType === 'create'}
			<Button
				variant="strong"
				dimension="small"
				onclick={createTransaction}
				disabled={createDisabled}><Checkmark size={16} />{$_('Create')}</Button
			>
		{:else}
			<Button variant="strong" dimension="small" onclick={editTransaction} disabled={createDisabled}
				><Checkmark size={16} />{$_('Done')}</Button
			>
		{/if}
		<Button variant="secondary" dimension="small" onclick={cancel}
			><Close size={16} />{$_('Cancel')}</Button
		>
	</menu>
	{#if formType === 'edit'}
		<Button variant="ghost" dimension="small" onclick={deleteTransaction}
			><TrashCan size={16} />{$_(
				transaction.type === 'deposit' ? 'Delete deposit' : 'Delete withdrawal',
			)}</Button
		>
	{/if}
</form>

<style type="postcss">
	form {
		max-width: 560px;
		flex: 1;
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: stretch;
		align-items: center;
		gap: var(--half-padding);
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--half-padding);
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
	.summary {
		gap: var(--quarter-padding);
	}
</style>
