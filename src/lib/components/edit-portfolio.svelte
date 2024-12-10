<script lang="ts">
	import { Close, Checkmark, TrashCan } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import type { Client, Portfolio } from '$lib/types'
	import adapter from '$lib/adapters'
	import Select from '$lib/components/ui/select/select.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
	import Divider from '$lib/components/ui/divider.svelte'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { capitalizeFirstLetter, formatAge } from '$lib/utils'
	import DateAge from './date-age.svelte'
	import DeleteModal from './delete-modal.svelte'

	type Props = {
		client: Client
		portfolio?: Portfolio
		close: () => void
	}

	let { client, portfolio, close }: Props = $props()

	let name = $state(
		capitalizeFirstLetter($_('portfolio')) +
			' ' +
			(portfolioStore.filter(client.id).length + 1).toString(),
	)
	let currency = $state('EUR')
	let inflation = $state(0.0225)
	let nowDate = new Date()
	let startDate = $state(nowDate)
	let horizon = $state('0')
	let initialHorizonYears = 30
	let initialEndDate = new Date(nowDate)
	initialEndDate.setFullYear(nowDate.getFullYear() + initialHorizonYears)
	let endDate = $state(initialEndDate)
	let showConfirmModal = $state(false)
	let createDisabled = $derived(name === '')
	let formType: 'edit' | 'create' = $derived(portfolio ? 'edit' : 'create')

	$effect(() => {
		if (!portfolio) {
			return
		}
		name = portfolio.name
		currency = portfolio.currency
		inflation = portfolio.inflation_rate
		startDate = new Date(portfolio.start_date)
		endDate = new Date(portfolio.end_date)
	})

	$effect(() => {
		if (startDate || endDate) {
			horizon = formatAge(new Date(startDate), new Date(endDate))
		}
	})

	async function createPortfolio() {
		await adapter.addPortfolio({
			client: client.id,
			name,
			currency,
			start_date: startDate.toDateString(),
			end_date: endDate.toDateString(),
			inflation_rate: inflation,
			link: null,
		})
		close()
	}

	async function updatePortfolio() {
		if (!portfolio) {
			return
		}

		await adapter.updatePortfolio({
			id: portfolio.id,
			name,
			currency,
			start_date: startDate.toDateString(),
			end_date: endDate.toDateString(),
			inflation_rate: inflation,
		})
		close()
	}

	function cancel(event: Event) {
		// FIXME: not sure why this is needed here, but it won't work without it
		event.preventDefault()
		close()
	}

	function onHorizonInput() {
		if (!horizon) {
			endDate = startDate
			return
		}
		let horizonNumber = parseInt(horizon, 10)
		if (Number.isNaN(horizonNumber)) {
			return
		}
		if (horizonNumber < 0) {
			horizonNumber = Math.abs(horizonNumber)
		}

		const date = new Date(startDate)
		date.setFullYear(new Date(startDate).getFullYear() + horizonNumber)

		endDate = date
	}

	function checkHorizonInput() {
		if (!horizon) {
			horizon = formatAge(new Date(startDate), new Date(endDate))
			return
		}
		let horizonNumber = parseInt(horizon, 10)
		if (Number.isNaN(horizonNumber)) {
			horizon = formatAge(new Date(startDate), new Date(endDate))
			return
		}
		if (horizonNumber < 0) {
			horizon = Math.abs(horizonNumber).toString()
			return
		}
	}

	function confirmDeletePortfolio() {
		showConfirmModal = true
	}

	async function deletePortfolio() {
		if (!portfolio) {
			return
		}
		showConfirmModal = false
		await adapter.deletePortfolio({ id: portfolio.id })
		close()
	}
</script>

<form class="vertical">
	<section class="horizontal">
		{#if formType === 'create'}
			<Typography variant="h4">{$_('addPortfolio')}</Typography>
		{:else}
			<Typography variant="h4">{$_('Edit portfolio')}</Typography>
		{/if}
		<div class="grower"></div>
		<Typography>{client.name}</Typography>
	</section>
	<div class="spacer"></div>
	<Input
		autofocus
		dimension="compact"
		variant="solid"
		placeholder={$_('portfolioName')}
		label={$_('portfolioName')}
		bind:value={name}
	></Input>
	<section class="horizontal">
		<Select
			variant="solid"
			dimension="compact"
			bind:value={currency}
			placeholder={$_('currency')}
			label={$_('currency')}
			class="grower"
		>
			<Option value="EUR">EUR</Option>
			<Option value="USD">USD</Option>
			<Option value="CZK">CZK</Option>
		</Select>
		<Input
			type="number"
			variant="solid"
			dimension="compact"
			placeholder={$_('inflation')}
			label={$_('inflation')}
			unit="%"
			value={(inflation * 100).toString(10)}
			step={'.01'}
			class="grower"
		></Input>
	</section>
	<Divider />

	<DateAge
		dimension="compact"
		dateInputLabel={$_('startDate')}
		bind:date={startDate}
		ageLabel={$_('clientAge') + ' ' + $_('atPortfolioStart')}
		agePlaceholder={$_('clientAge')}
		birthDate={new Date(client.birth_date)}
	/>

	<Input
		variant="solid"
		dimension="compact"
		placeholder={$_('horizon')}
		label={$_('horizon')}
		unit={$_('years')}
		bind:value={horizon}
		oninput={onHorizonInput}
		onblur={checkHorizonInput}
	></Input>

	<DateAge
		dimension="compact"
		dateInputLabel={$_('endDate')}
		bind:date={endDate}
		ageLabel={$_('clientAge') + ' ' + $_('atPortfolioEnd')}
		agePlaceholder={$_('clientAge')}
		birthDate={new Date(client.birth_date)}
	/>

	<section class="buttons horizontal">
		{#if formType === 'create'}
			<Button
				variant="strong"
				dimension="compact"
				onclick={createPortfolio}
				disabled={createDisabled}><Checkmark size={24} />{$_('createPortfolio')}</Button
			>
		{:else}
			<Button
				variant="strong"
				dimension="compact"
				onclick={updatePortfolio}
				disabled={createDisabled}><Checkmark size={24} />{$_('Done')}</Button
			>
		{/if}
		<Button variant="secondary" dimension="compact" onclick={cancel}
			><Close size={24} />{$_('cancel')}</Button
		>
		{#if formType === 'edit'}
			<div class="grower"></div>
			<Button variant="ghost" dimension="compact" onclick={confirmDeletePortfolio}
				><TrashCan size={24} />{$_('Delete portfolio')}</Button
			>
		{/if}
	</section>
</form>

<DeleteModal
	confirm={deletePortfolio}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('Delete portfolio?')}
	text={$_(
		'This portfolio and all the investments it contains will be deleted permanently. There’s no undo.',
	)}
/>

<style>
	form {
		max-width: 560px;
		flex: 1;
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--padding);
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--padding);
	}
	.horizontal :global(.grower) {
		flex: 1;
	}
	.buttons {
		margin-top: var(--padding);
		gap: var(--half-padding);
	}
	.spacer {
		margin-top: var(--half-padding);
	}
	.grower {
		flex: 1;
	}
</style>
