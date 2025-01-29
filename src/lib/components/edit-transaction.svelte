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
	} from '$lib/types'
	import adapter from '$lib/adapters'
	import Select from '$lib/components/ui/select/select.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
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
	} from 'date-fns'
	import FlexItem from './ui/flex-item.svelte'
	import { calculateNumOccurrences } from '$lib/calc'

	type Props = {
		investment: Investment
		portfolio: Portfolio
		client: Client
		transaction?: Transaction
		close: () => void
	}

	let { investment, portfolio, client, transaction, close }: Props = $props()

	let transactionType = $state(transaction?.type || 'deposit')
	let label = $state('')
	let amount = $state(0)
	let date = $state(new Date())
	let isRecurring = $state(false)
	let repeat = $state(1)
	let repeatUnit: TimeUnit = $state('month')
	let endDate = $state(new Date())
	let period = $state(30)
	let periodUnit: TimeUnit = $state('year')
	const numOccurrences = $derived(
		calculateNumOccurrences(
			formatDate(date),
			formatDate(endDate) ?? formatDate(date),
			repeatUnit ?? 'month',
			repeat ?? 1,
		),
	)
	const totalAmount = $derived(numOccurrences * Number(amount))
	const createDisabled = $derived(
		label === '' || amount === 0 || (isRecurring && totalAmount === 0),
	)
	const formType = $derived(transaction ? 'edit' : 'create')

	$effect(() => {
		label =
			transaction && transaction.label
				? transaction.label
				: capitalizeFirstLetter($_(transactionType)) +
					' ' +
					(investmentStore.filter(investment.id).length + 1).toString()
		amount = transaction ? transaction.amount : 0
		date = new Date(formatDate(transaction ? new Date(transaction.date) : new Date()))
		isRecurring = transaction ? transaction.end_date !== null : false
		repeat = transaction && transaction.repeat ? transaction.repeat : 1
		repeatUnit = transactionRepeatUnit(transaction)
		endDate = new Date(
			formatDate(transaction && transaction.end_date ? new Date(transaction.end_date) : new Date()),
		)
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
		if (!transaction) {
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
		if (!transaction) {
			return
		}

		if (confirm($_('Are you sure you want to delete?'))) {
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
		return t && t.id && t.repeat_unit ? (t.repeat_unit as TimeUnit) : 'month'
	}

	function transactionPeriod(t: typeof transaction) {
		if (!t || !t.id || !t.end_date) {
			return 30
		}

		return dateDifferenceFunction(transactionRepeatUnit(t))(t.end_date, t.date)
	}

	function transactionPeriodUnit(t: typeof transaction): TimeUnit {
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
		endDate = addDays(addDate(date, period), -1)
	}

	function toggleRecurring() {
		recalculateEndDate()
	}
</script>

<main class="vertical">
	<section class="horizontal">
		<Typography variant="h5"
			>{formType === 'create' ? $_('Add') : $_('Edit')}{$_(' transaction')}</Typography
		>
		<FlexItem />
		<Button dimension="compact" variant="ghost" onclick={cancel}><Close size={24} /></Button>
	</section>
	<div class="spacer"></div>
	<div class="horizontal flex-end">
		<Select variant="solid" dimension="compact" bind:value={transactionType} label={$_('Type')}>
			<Option value="deposit">{capitalizeFirstLetter($_('deposit'))}</Option>
			<Option value="withdrawal">{capitalizeFirstLetter($_('withdrawal'))}</Option>
		</Select>
		<Toggle
			class="toggle"
			dimension="compact"
			label={$_('Recurring')}
			bind:checked={isRecurring}
			onchange={toggleRecurring}
		></Toggle>
	</div>
	<Input
		type="number"
		variant="solid"
		dimension="compact"
		placeholder={'0'}
		label={$_('Amount')}
		unit={portfolio.currency}
		bind:value={amount}
		min={1}
		step={1}
		class="grower"
	></Input>
	<Input
		dimension="compact"
		variant="solid"
		placeholder={$_('Label')}
		label={$_('Label')}
		bind:value={label}
	></Input>
	<DateAge
		dimension="compact"
		dateInputLabel={$_('Start date')}
		ageLabel={$_('Client´s age at start')}
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
				dimension="compact"
				placeholder={'1'}
				label={$_('Repeats every')}
				min={1}
				step={1}
				bind:value={repeat}
				style="max-width: 100%"
			></Input>
			<Select variant="solid" dimension="compact" bind:value={repeatUnit}>
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
				dimension="compact"
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
				dimension="compact"
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
			dimension="compact"
			dateInputLabel={$_('End date')}
			ageLabel={$_('Client´s age at end')}
			agePlaceholder={'0'}
			bind:date={endDate}
			birthDate={new Date(client.birth_date)}
			onchange={onEndDateChange}
		></DateAge>
		<div class="spacer"></div>
		<section class="summary vertical">
			<Typography>{numOccurrences} {$_('occurences')}</Typography>
			<Typography
				>{formatCurrency(totalAmount, portfolio.currency)} ({transactionType === 'deposit'
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
				dimension="compact"
				onclick={createTransaction}
				disabled={createDisabled}><Checkmark size={16} />{$_('Create')}</Button
			>
		{:else}
			<Button
				variant="strong"
				dimension="compact"
				onclick={editTransaction}
				disabled={createDisabled}><Checkmark size={16} />{$_('Done')}</Button
			>
		{/if}
		<Button variant="secondary" dimension="compact" onclick={cancel}
			><Close size={16} />{$_('Cancel')}</Button
		>
	</menu>
	{#if formType === 'edit'}
		<Button variant="ghost" dimension="compact" onclick={deleteTransaction}
			><TrashCan size={16} />{$_('Delete transaction')}</Button
		>
	{/if}
</main>

<style type="postcss">
	main {
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
	.flex-end {
		align-items: flex-end;
		:global(.toggle) {
			border: 1px solid transparent;
		}
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
