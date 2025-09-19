<script lang="ts">
	import { Close, Checkmark, TrashCan } from 'carbon-icons-svelte'
	import { _, locale } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import FormattedNumberInput from '$lib/components/ui/input/formatted-number/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { type Client, type Investment, type Portfolio, type Transaction } from '$lib/types'
	import {
		type Period,
		type TransactionType,
		calculateTotalDisplayAmount,
		type Transaction as MathTransaction,
	} from '$lib/@snaha/kalkul-maths'
	import adapter from '$lib/adapters'
	import Select from '$lib/components/ui/select/select.svelte'
	import { asyncTimeout, capitalizeFirstLetter, formatCurrency } from '$lib/utils'
	import {
		formatDate,
		incrementDate,
		calculatePeriodDifference,
	} from '$lib/@snaha/kalkul-maths/date'
	import DateAge from './date-age.svelte'
	import Toggle from './ui/toggle.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import { subDays } from 'date-fns'
	import FlexItem from './ui/flex-item.svelte'
	import Vertical from './ui/vertical.svelte'
	import Horizontal from './ui/horizontal.svelte'
	import { calculateNumOccurrences } from '$lib/@snaha/kalkul-maths'
	import HelperTooltip from './helper-tooltip.svelte'
	import Loader from './ui/loader.svelte'

	type Props = {
		investment: Investment
		portfolio: Portfolio
		client: Client
		transaction?: Transaction
		showInflation?: boolean
		close: () => void
	}

	let { investment, portfolio, client, transaction, showInflation = false, close }: Props = $props()

	let transactionType: TransactionType = $state('deposit')
	let label = $state('')
	let amount = $state<number | undefined>(undefined)
	let date = $state(new Date())
	let inflationAdjusted = $state(false)
	let isRecurring = $state(false)
	let repeat = $state(1)
	let repeatUnit: Period = $state('month')
	let endDate = $state(new Date())
	let period = $state(30)
	let periodUnit: Period = $state('year')
	let createClicked = $state(false)

	const numOccurrences = $derived(
		calculateNumOccurrences({
			date: formatDate(date),
			end_date: formatDate(endDate),
			repeat_unit: repeatUnit,
			repeat,
		}),
	)
	const totalAmounts = $derived.by(() => {
		if (amount === undefined) return { nominal: 0, adjusted: 0 }

		// Create a mock transaction for calculation
		const mockTransaction: MathTransaction = {
			amount,
			type: transactionType,
			date: formatDate(date),
			inflation_adjusted: inflationAdjusted,
			end_date: isRecurring ? formatDate(endDate) : null,
			repeat: isRecurring ? repeat : null,
			repeat_unit: isRecurring ? repeatUnit : null,
		}

		return calculateTotalDisplayAmount(
			[mockTransaction],
			transactionType,
			portfolio.inflation_rate,
			portfolio.start_date,
		)
	})

	const totalAmount = $derived(showInflation ? totalAmounts.adjusted : totalAmounts.nominal)
	const createDisabled = $derived(
		amount === undefined ||
			amount <= 0 ||
			(isRecurring && totalAmounts.nominal === 0 && totalAmounts.adjusted === 0) ||
			createClicked,
	)
	const formType = $derived(transaction ? 'edit' : 'create')

	$effect(() => {
		if (transaction) {
			transactionType = transaction.type
			label = transaction.label ?? ''
			amount = transaction.amount
			date = new Date(transaction.date)
			inflationAdjusted = transaction.inflation_adjusted ?? false
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

		createClicked = true
		await asyncTimeout(0)

		await adapter.addTransaction({
			investment_id: investment.id,
			type: transactionType,
			amount,
			label,
			date: formatDate(date),
			inflation_adjusted: inflationAdjusted,
			repeat: isRecurring ? repeat : null,
			repeat_unit: isRecurring ? repeatUnit : null,
			end_date: isRecurring ? formatDate(endDate) : null,
		})
		close()
	}

	async function editTransaction() {
		if (!transaction || amount === undefined || amount <= 0) {
			return
		}

		createClicked = true
		await asyncTimeout(0)

		await adapter.updateTransaction({
			id: transaction.id,
			investment_id: investment.id,
			type: transactionType,
			amount,
			label,
			date: formatDate(date),
			inflation_adjusted: inflationAdjusted,
			repeat: isRecurring ? repeat : null,
			repeat_unit: isRecurring ? repeatUnit : null,
			end_date: isRecurring ? formatDate(endDate) : null,
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

	function transactionRepeatUnit(t: typeof transaction): Period {
		return t && t.repeat_unit ? t.repeat_unit : 'month'
	}

	function transactionPeriod(t: typeof transaction) {
		if (!t || !t.id || !t.end_date) {
			return 30
		}

		return (
			calculatePeriodDifference(new Date(t.end_date), new Date(t.date), transactionRepeatUnit(t)) +
			1
		)
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
		period = calculatePeriodDifference(endDate, date, periodUnit) + 1
	}

	function recalculateEndDate() {
		endDate = subDays(incrementDate(date, periodUnit, period), 1)
	}

	function checkPeriodInput() {
		if (!period || period <= 0) {
			recalculatePeriod()
		}
	}

	function toggleRecurring() {
		recalculateEndDate()
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
	<Horizontal --horizontal-justify-content="space-between">
		<Toggle
			class="toggle"
			dimension="compact"
			label={$_('component.editTransaction.inflationAdjusted')}
			bind:checked={inflationAdjusted}
		></Toggle>
		<HelperTooltip helperText={$_('component.viewHeader.inflationAdjustmentTooltip')} />
	</Horizontal>
	<Input
		dimension="compact"
		variant="solid"
		placeholder={transactionType === 'deposit'
			? $_('common.labelPlaceholderDeposit')
			: $_('common.labelPlaceholderWithdrawal')}
		label={$_('common.label')}
		bind:value={label}
	></Input>
	<DateAge
		dimension="compact"
		dateInputLabel={$_('common.startDate')}
		ageLabel={$_('common.clientAge')}
		agePlaceholder={'0'}
		bind:date
		birthDate={new Date(client.birth_date)}
		onchange={onDateChange}
	></DateAge>
	{#if !isRecurring}
		<!-- Single transaction -->
		{#if inflationAdjusted}
			<!-- Inflation-adjusted: show both real and nominal values -->
			{#if showInflation}
				<!-- Show inflation ON: real value primary, nominal value secondary -->
				<div class="spacer"></div>
				<Vertical --vertical-gap="var(--quarter-padding)">
					<Typography class="total-amount">
						{$_('common.realValue')}: {formatCurrency(
							totalAmounts.adjusted,
							portfolio.currency,
							$locale,
						)}
					</Typography>
					<Typography class="total-amount secondary">
						{$_('common.nominalValue')}: {formatCurrency(
							totalAmounts.nominal,
							portfolio.currency,
							$locale,
						)}
					</Typography>
				</Vertical>
			{:else}
				<!-- Show inflation OFF: nominal value primary, real value secondary -->
				<div class="spacer"></div>
				<Vertical --vertical-gap="var(--quarter-padding)">
					<Typography class="total-amount">
						{$_('common.nominalValue')}: {formatCurrency(
							totalAmounts.nominal,
							portfolio.currency,
							$locale,
						)}
					</Typography>
					<Typography class="total-amount secondary">
						{$_('common.realValue')}: {formatCurrency(
							totalAmounts.adjusted,
							portfolio.currency,
							$locale,
						)}
					</Typography>
				</Vertical>
			{/if}
		{:else if showInflation}
			<!-- Not inflation-adjusted, show inflation ON: display real and nominal values -->
			<div class="spacer"></div>
			<Vertical --vertical-gap="var(--quarter-padding)">
				<Typography class="total-amount">
					{$_('common.realValue')}: {formatCurrency(
						totalAmounts.adjusted,
						portfolio.currency,
						$locale,
					)}
				</Typography>
				<Typography class="total-amount secondary">
					{$_('common.nominalValue')}: {formatCurrency(
						totalAmounts.nominal,
						portfolio.currency,
						$locale,
					)}
				</Typography>
			</Vertical>
		{/if}
		<!-- Not inflation-adjusted, show inflation OFF: display only form inputs -->
	{/if}
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
			<Input
				type="number"
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
				onkeydown={(e) => {
					// Prevent decimal separator (. and ,) and negative sign (-)
					if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === 'E') {
						e.preventDefault()
					}
				}}
				onpaste={(e) => {
					// Clean pasted content to only allow positive integers
					e.preventDefault()
					const paste = e.clipboardData?.getData('text') || ''
					const cleanedValue = paste.replace(/[^0-9]/g, '') // Remove everything except digits
					if (cleanedValue) {
						const numValue = parseInt(cleanedValue, 10)
						if (numValue > 0) {
							period = numValue
							onPeriodChange() // Trigger the change handler
						}
					}
				}}
				inputmode="numeric"
				pattern="[0-9]*"
			></Input>
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
			ageLabel={$_('common.clientAge')}
			agePlaceholder={'0'}
			bind:date={endDate}
			birthDate={new Date(client.birth_date)}
			onchange={onEndDateChange}
		></DateAge>
		<div class="spacer"></div>
		<Vertical --vertical-gap="var(--quarter-padding)">
			<Typography>{numOccurrences} {$_('component.editTransaction.occurrences')}</Typography>
			{#if inflationAdjusted}
				<!-- Inflation-adjusted: show both total real and total nominal values -->
				{#if showInflation}
					<!-- Show inflation ON: total real primary, total nominal secondary -->
					<Typography class="total-amount">
						{$_('common.totalReal')}: {formatCurrency(
							totalAmounts.adjusted,
							portfolio.currency,
							$locale,
						)}
					</Typography>
					<Typography class="total-amount secondary">
						{$_('common.totalNominal')}: {formatCurrency(
							totalAmounts.nominal,
							portfolio.currency,
							$locale,
						)}
					</Typography>
				{:else}
					<!-- Show inflation OFF: total nominal primary, total real secondary -->
					<Typography class="total-amount">
						{$_('common.totalNominal')}: {formatCurrency(
							totalAmounts.nominal,
							portfolio.currency,
							$locale,
						)}
					</Typography>
					<Typography class="total-amount secondary">
						{$_('common.totalReal')}: {formatCurrency(
							totalAmounts.adjusted,
							portfolio.currency,
							$locale,
						)}
					</Typography>
				{/if}
			{:else if showInflation}
				<!-- Not inflation-adjusted, show inflation ON: display total real and total nominal -->
				<Typography class="total-amount">
					{$_('common.totalReal')}: {formatCurrency(
						totalAmounts.adjusted,
						portfolio.currency,
						$locale,
					)}
				</Typography>
				<Typography class="total-amount secondary">
					{$_('common.totalNominal')}: {formatCurrency(
						totalAmounts.nominal,
						portfolio.currency,
						$locale,
					)}
				</Typography>
			{:else}
				<!-- Not inflation-adjusted, show inflation OFF: display total deposited/withdrawn -->
				<Typography class="total-amount">
					{transactionType === 'deposit'
						? $_('component.viewHeader.totalDeposited', {
								values: { amount: formatCurrency(totalAmount, portfolio.currency, $locale) },
							})
						: $_('component.viewHeader.totalWithdrawn', {
								values: { amount: formatCurrency(totalAmount, portfolio.currency, $locale) },
							})}
				</Typography>
			{/if}
		</Vertical>
	{/if}
	<div class="spacer"></div>
	<menu class="buttons horizontal">
		{#if formType === 'create'}
			<Button
				variant="strong"
				dimension="compact"
				onclick={createTransaction}
				disabled={createDisabled}
				busy={createClicked}
				>{#if createClicked}<Loader dimension="small" color="low" />{:else}<Checkmark
						size={16}
					/>{/if}{$_('common.create')}</Button
			>
		{:else}
			<Button
				variant="strong"
				dimension="compact"
				onclick={editTransaction}
				disabled={createDisabled}
				busy={createClicked}
				>{#if createClicked}<Loader dimension="small" color="low" />{:else}<Checkmark
						size={16}
					/>{/if}{$_('common.done')}</Button
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
	:global(.total-amount) {
		color: var(--colors-high);
	}
	:global(.total-amount.secondary) {
		color: var(--colors-ultra-high);
		opacity: 0.5;
	}
</style>
