<script lang="ts">
	import DateInput from '$lib/components/ui/input/date-input.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { formatAge } from '$lib/utils'
	import { addYears } from 'date-fns'
	import { _ } from 'svelte-i18n'

	type Dimension = 'default' | 'large' | 'compact' | 'small'

	type Props = {
		dimension?: Dimension
		dateInputLabel: string
		ageLabel: string
		agePlaceholder: string
		date: Date
		birthDate: Date
		onchange?: () => void
	}

	let {
		dimension = 'default',
		dateInputLabel,
		ageLabel,
		agePlaceholder,
		date = $bindable(),
		birthDate,
		onchange,
	}: Props = $props()

	let age = $state(formatAge(birthDate, date))

	function onAgeInput() {
		if (!age) {
			date = new Date()
			return
		}
		let ageNumber = parseInt(age, 10)
		if (Number.isNaN(ageNumber)) {
			// TODO display error
			return
		}
		if (ageNumber < 0) {
			ageNumber = Math.abs(ageNumber)
		}

		date = addYears(birthDate, ageNumber)
	}

	function checkAgeInput() {
		if (!age) {
			age = formatAge(new Date(birthDate), new Date(date))
			return
		}
		let ageNumber = parseInt(age, 10)
		if (Number.isNaN(ageNumber)) {
			age = formatAge(new Date(birthDate), new Date(date))
			return
		}
		if (ageNumber < 0) {
			age = Math.abs(ageNumber).toString()
			return
		}
	}

	$effect(() => {
		if (date) {
			age = formatAge(new Date(birthDate), new Date(date))
		}
	})
</script>

<section class="horizontal">
	<DateInput
		variant="solid"
		{dimension}
		label={dateInputLabel}
		bind:value={date}
		class="date-age-grower"
		style="max-width: 100%"
		{onchange}
	></DateInput>
	<Input
		type="number"
		variant="solid"
		{dimension}
		placeholder={agePlaceholder}
		label={ageLabel}
		unit={$_('years')}
		bind:value={age}
		class="date-age-grower"
		style="max-width: 100%"
		oninput={onAgeInput}
		step={1}
		min={0}
		onblur={checkAgeInput}
		{onchange}
	></Input>
</section>

<style>
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--padding);
	}
	.horizontal :global(.date-age-grower) {
		flex: 1;
		max-width: calc(50% - var(--half-padding));
	}
</style>
