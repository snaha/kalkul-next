<script lang="ts">
	import { Close, Checkmark } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import type { Client } from '$lib/types'
	import adapter from '$lib/adapters'
	import Select from '$lib/components/ui/select/select.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
	import Divider from '$lib/components/ui/divider.svelte'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { capitalizeFirstLetter, formatAge, formatDate } from '$lib/utils'
	import DateAge from './date-age.svelte'

	type Props = {
		client: Client
		close: () => void
	}

	let { client, close }: Props = $props()

	let name = $state(
		capitalizeFirstLetter($_('portfolio')) +
			' ' +
			(portfolioStore.filter(client.id).length + 1).toString(),
	)
	let currency = $state('EUR')
	let inflation = $state(0.0225)
	let nowDate = new Date()
	let startDate = $state(formatDate(nowDate))
	let horizon = $state('0')
	let initialHorizonYears = 30
	let initialEndDate = new Date(nowDate)
	initialEndDate.setFullYear(nowDate.getFullYear() + initialHorizonYears)
	let endDate = $state(formatDate(initialEndDate))

	let createDisabled = $derived(name === '')

	async function create() {
		await adapter.addPortfolio({
			client: client.id,
			name,
			currency,
			start_date: startDate,
			end_date: endDate,
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

		endDate = formatDate(date)
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

	$effect(() => {
		if (startDate || endDate) {
			horizon = formatAge(new Date(startDate), new Date(endDate))
		}
	})
</script>

<form class="vertical">
	<section class="horizontal">
		<Typography variant="h4">{$_('addPortfolio')}</Typography>
		<div class="grower"></div>
		<Typography>{$_('for')} {client.name}</Typography>
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
		dateInputLabel={$_('endDate')}
		bind:date={endDate}
		ageLabel={$_('clientAge') + ' ' + $_('atPortfolioEnd')}
		agePlaceholder={$_('clientAge')}
		birthDate={new Date(client.birth_date)}
	/>

	<section class="buttons horizontal">
		<Button variant="strong" dimension="compact" onclick={create} disabled={createDisabled}
			><Checkmark size={24} />{$_('createPortfolio')}</Button
		>
		<Button variant="secondary" dimension="compact" onclick={cancel}
			><Close size={24} />{$_('cancel')}</Button
		>
	</section>
</form>

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
</style>
