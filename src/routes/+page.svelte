<script lang="ts">
	import { _ } from 'svelte-i18n'
	import { page } from '$app/stores'
	import routes from '$lib/routes'
	import { detailStore, type DetailsStoreValues } from '$lib/stores/details.svelte'
	import { resultStore } from '$lib/stores/results.svelte'
	import Language from '$lib/components/language.svelte'
	import Input from '$lib/components/input/input.svelte'
	import Select from '$lib/components/select.svelte'
	import Option from '$lib/components/option.svelte'
	import Operation from '$lib/components/operation.svelte'
	import { Add, Edit, TrashCan } from 'carbon-icons-svelte'
	import Button from '$lib/components/button.svelte'
	import { supportedCurrenciesWithLabels } from '$lib/types'
	import { formatDate, initialValues } from '$lib/utils'
	import { z } from 'zod'
	import { withFormStore, type FormStore } from '$lib/stores/form.svelte'
	import { dateOfBirthSchema, endAgeSchema, supportedCurrenciesSchema } from '$lib/schemas'
	import Error from '$lib/components/error.svelte'
	import { locale } from 'svelte-i18n'
	import ChartComponent from '$lib/components/chart.svelte'
	import DateInput from '$lib/components/input/date-input.svelte'

	let hash = $state('')
	let loading = $state<boolean>(true)
	let dateOfBirth = withFormStore(initialValues.dateOfBirth, dateOfBirthSchema)
	let endAge = withFormStore(initialValues.endAge, endAgeSchema)
	let currency = withFormStore(initialValues.currency, supportedCurrenciesSchema)
	let inflation = withFormStore(initialValues.inflation, z.number().nonnegative())
	let apy = withFormStore(initialValues.apy, z.number().nonnegative())
	let feeSuccess = withFormStore(initialValues.feeSuccess, z.number().nonnegative())
	let feeManagement = withFormStore(initialValues.feeManagement, z.number().nonnegative())
	let entryFee = withFormStore(initialValues.entryFee, z.number().nonnegative())
	let withdrawalFee = withFormStore(initialValues.withdrawalFee, z.number().nonnegative())

	function synchronize<T extends string | number | Date, V extends string | number | Date>(
		loading: boolean,
		form: FormStore<V, T>,
		store: DetailsStoreValues,
		key: keyof DetailsStoreValues,
	) {
		if (loading) return

		if (!form.edited) {
			const storeVal = store[key]
			if (storeVal instanceof Date) (form.value as string) = formatDate(storeVal)
			else (form.value as unknown) = storeVal as unknown
		} else if (
			form.parsedValue !== undefined &&
			((form.parsedValue instanceof Date &&
				store[key] instanceof Date &&
				form.parsedValue.getTime() !== (store[key] as Date).getTime()) ||
				form.parsedValue !== store[key])
		)
			(store[key] as unknown) = form.parsedValue
	}

	$effect(() => synchronize(loading, dateOfBirth, detailStore, 'dateOfBirth'))
	$effect(() => synchronize(loading, endAge, detailStore, 'endAge'))
	$effect(() => synchronize(loading, currency, detailStore, 'currency'))
	$effect(() => synchronize(loading, inflation, detailStore, 'inflation'))
	$effect(() => synchronize(loading, apy, detailStore, 'apy'))
	$effect(() => synchronize(loading, entryFee, detailStore, 'entryFee'))
	$effect(() => synchronize(loading, withdrawalFee, detailStore, 'withdrawalFee'))
	$effect(() => synchronize(loading, feeManagement, detailStore, 'feeManagement'))
	$effect(() => synchronize(loading, feeSuccess, detailStore, 'feeSuccess'))

	$effect(() => {
		const newHash = detailStore.toUrl()

		if (hash !== newHash) {
			hash = newHash
			resultStore.update()
			window.location.hash = newHash
		}
	})

	page.subscribe(({ url }) => {
		if (!detailStore) return
		if (!url.hash) {
			loading = false
			return
		}

		let newHash = url.hash.slice(1)
		if (hash === newHash) return
		hash = newHash

		detailStore.restoreFromUrl(hash)
		resultStore.update()

		setTimeout(() => {
			dateOfBirth.value = formatDate(detailStore.dateOfBirth)
			inflation.value = detailStore.inflation
			endAge.value = detailStore.endAge
			currency.value = detailStore.currency
			apy.value = detailStore.apy
			entryFee.value = detailStore.entryFee
			withdrawalFee.value = detailStore.withdrawalFee
			feeManagement.value = detailStore.feeManagement
			feeSuccess.value = detailStore.feeSuccess
			loading = false
		}, 0)
	})

	function calculateAge(dateOfBirth: Date) {
		const today = new Date()
		let age = today.getFullYear() - dateOfBirth.getFullYear()
		const m = today.getMonth() - dateOfBirth.getMonth()

		// The birthday hasn't occurred yet this year
		if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) return age - 1
		return age
	}

	let age = $derived.by(() => calculateAge(new Date(detailStore.dateOfBirth)))

	const getLabels = () =>
		resultStore.graphData.map(
			(row) => row.date.getFullYear() - detailStore.dateOfBirth.getFullYear(),
		)
	const getTotalInvested = () => resultStore.graphData.map((row) => row.totalInvested)
	const getTotalDeposited = () => resultStore.graphData.map((row) => row.totalDeposited)
	const getTotalWithdrawn = () => resultStore.graphData.map((row) => row.totalWithdrawn)
	const getTotalFees = () => resultStore.graphData.map((row) => row.totalFees)
	const getTotalWithdrawFee = () => resultStore.graphData.map((row) => row.totalWithdrawFee)
	const getTotalDepositFee = () => resultStore.graphData.map((row) => row.totalDepositFee)
	const getTotalManagementFee = () => resultStore.graphData.map((row) => row.totalManagementFee)
	const getTotalSuccessFee = () => resultStore.graphData.map((row) => row.totalSuccessFee)

	let localeAmount = $derived(
		new Intl.NumberFormat($locale ?? 'cs-CZ', {
			style: 'currency',
			currency: detailStore.currency,
		}),
	)
</script>

{#if loading}
	Loading...
{:else}
	<section>
		<h5>{$_('clientInformations')}</h5>
		<Language />
		<div class="grid">
			<DateInput
				labelFor="dateOfBirth"
				placeholder={$_('dateOfBirth')}
				bind:value={dateOfBirth.value}
				variant="solid"
			>
				<!-- <Error errors={dateOfBirth.error} /> -->
			</DateInput>
			<Input
				type="number"
				labelFor="endAge"
				placeholder={$_('endAge')}
				bind:value={endAge.value}
				variant="solid"
			>
				<Error errors={endAge.error} />
			</Input>
		</div>
	</section>
	<section>
		<h5>{$_('portfolioInformations')}</h5>
		<div class="grid">
			<Input
				type="number"
				labelFor="apy"
				placeholder={$_('apy')}
				bind:value={apy.value}
				variant="solid"
			></Input>
			<Input
				type="number"
				labelFor="inflation"
				placeholder={$_('inflation')}
				bind:value={inflation.value}
				variant="solid"
			>
				<Error errors={inflation.error} />
			</Input>
			<Select bind:value={currency.value} placeholder={$_('currency')} variant="solid">
				{#each Object.entries(supportedCurrenciesWithLabels) as [value, label]}
					<Option {value}>{label}</Option>
				{/each}
			</Select>
			<Input
				type="number"
				labelFor="entryFee"
				placeholder={$_('entryFee')}
				bind:value={entryFee.value}
				variant="solid"
			>
				<Error errors={entryFee.error} />
			</Input>
			<Input
				type="number"
				labelFor="inflation"
				placeholder={$_('withdrawalFee')}
				bind:value={withdrawalFee.value}
				variant="solid"
			>
				<Error errors={withdrawalFee.error} />
			</Input>
			<Input
				type="number"
				labelFor="feeManagement"
				placeholder={$_('feeMangement')}
				bind:value={feeManagement.value}
				variant="solid"
			>
				<Error errors={feeManagement.error} />
			</Input>
			<Input
				type="number"
				labelFor="feeSuccess"
				placeholder={$_('feeSuccess')}
				bind:value={feeSuccess.value}
				variant="solid"
			>
				<Error errors={feeSuccess.error} />
			</Input>
		</div>
	</section>
	<section>
		<div class="flex-add-deposit">
			<h5>{$_('plannedDeposits')}</h5>
			<Button variant="ghost" href={routes.DEPOSIT()}><Add size={24} /></Button>
		</div>
		<div class="grid">
			{#each detailStore.deposits as deposit, i}
				<Operation operation={deposit} currency={localeAmount}>
					<Button variant={'ghost'} href={routes.DEPOSIT(i)}><Edit size={24} /></Button>
					<Button variant={'ghost'} onclick={() => detailStore.removeDeposit(i)}
						><TrashCan size={24} /></Button
					>
				</Operation>
			{/each}
		</div>
	</section>
	<section>
		<div class="flex-add-deposit">
			<h5>{$_('plannedWithdrawals')}</h5>
			<Button variant="ghost" href={routes.WITHDRAWAL()}><Add size={24} /></Button>
		</div>
		<div class="grid">
			{#each detailStore.withdrawals as withdrawal, i}
				<Operation operation={withdrawal} currency={localeAmount}>
					<Button variant={'ghost'} href={routes.WITHDRAWAL(i)}><Edit size={24} /></Button>
					<Button variant={'ghost'} onclick={() => detailStore.removeWithdrawal(i)}
						><TrashCan size={24} /></Button
					>
				</Operation>
			{/each}
		</div>
	</section>
	<section>
		<ChartComponent
			labels={getLabels()}
			series={[
				{ label: 'Invested value', data: getTotalInvested(), fill: { target: 'origin' } },
				{
					label: 'Total deposited',
					data: getTotalDeposited(),
					fill: { target: 'origin' },
					hidden: true,
				},
				{
					label: 'Total withdrawn',
					data: getTotalWithdrawn(),
					fill: { target: 'origin' },
					hidden: true,
				},
				{
					label: 'Total deposited fee',
					data: getTotalDepositFee(),
					fill: { target: 'origin' },
					hidden: true,
				},
				{
					label: 'Total withdrawn fee',
					data: getTotalWithdrawFee(),
					fill: { target: 'origin' },
					hidden: true,
				},
				{
					label: 'Total management fee',
					data: getTotalManagementFee(),
					fill: { target: 'origin' },
					hidden: true,
				},
				{
					label: 'Total success fee',
					data: getTotalSuccessFee(),
					fill: { target: 'origin' },
					hidden: true,
				},
				{ label: 'Total fees', data: getTotalFees(), fill: { target: 'origin' }, hidden: true },
			]}
		></ChartComponent>
	</section>
	<section>
		<h5>{$_('results')}</h5>
		<div class="grid">
			<Input
				type={'text'}
				readonly
				placeholder={$_('effectiveEvaluation')}
				value={`${(resultStore.effectiveApy * 100).toFixed(2)} %`}
				variant="solid"
			></Input>
			<Input
				type={'text'}
				readonly
				placeholder={$_('totalDeposits')}
				value={localeAmount.format(resultStore.totalDeposited)}
				variant="solid"
			></Input>
			<Input
				type={'text'}
				readonly
				placeholder={$_('totalWithdrawals')}
				value={localeAmount.format(resultStore.totalWithdrawn)}
				variant="solid"
			></Input>
			<Input
				type={'text'}
				readonly
				placeholder={$_('remainingPortfolioValue')}
				value={localeAmount.format(resultStore.totalInvested)}
				variant="solid"
			></Input>
			<Input type={'text'} readonly placeholder={$_('clientAge')} value={age} variant="solid"
			></Input>
		</div>
		<h5>{$_('paidOnFees')}</h5>
		<div class="grid">
			<Input
				type={'text'}
				readonly
				placeholder={$_('entryFee')}
				value={localeAmount.format(resultStore.totalDepositFee)}
				variant="solid"
			></Input>
			<Input
				type={'text'}
				readonly
				placeholder={$_('withdrawalFee')}
				value={localeAmount.format(resultStore.totalWithdrawFee)}
				variant="solid"
			></Input>
			<Input
				type={'text'}
				readonly
				placeholder={$_('feeMangement')}
				value={localeAmount.format(resultStore.totalManagementFee)}
				variant="solid"
			></Input>
			<Input
				type={'text'}
				readonly
				placeholder={$_('feeSuccess')}
				value={localeAmount.format(resultStore.totalSuccessFee)}
				variant="solid"
			></Input>
		</div>
	</section>
	<section>
		<h5>{$_('disclaimer')}</h5>
		<p class="smallParagraph">{$_('disclaimerText')}</p>
	</section>
{/if}

<style>
	section {
		position: relative;
		padding-bottom: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	section > h5 {
		padding-bottom: 1rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16.5rem, 1fr));
		gap: 1rem;
		justify-content: center;
		align-items: start;
		width: 100%;
	}
	.flex-add-deposit {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		position: relative;
	}
	h5 {
		color: var(--colors-ultraHigh, #303030);
		/* h5 */
		font-family: Arial;
		font-size: 1rem;
		font-style: normal;
		font-weight: 700;
		line-height: 1.5rem;
		letter-spacing: 0.02rem;
	}
	.smallParagraph {
		align-self: stretch;
		color: var(--colors-ultraHigh, #303030);
		/* smallParagraph */
		font-family: Arial;
		font-size: 0.75rem;
		font-style: normal;
		font-weight: 400;
		line-height: 1rem; /* 133.333% */
		letter-spacing: 0.0375rem;
		padding: 0 0.75rem;
	}
</style>
