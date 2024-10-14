<script lang="ts">
	import DateInput from '$lib/components/ui/input/date-input.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { formatAge, formatDate } from '$lib/utils'
	import { _ } from 'svelte-i18n'

	type Props = {
		dateInputLabel: string
		ageLabel: string
		agePlaceholder: string
		date: string
		birthDate: Date
	}

	let { dateInputLabel, ageLabel, agePlaceholder, date = $bindable(), birthDate }: Props = $props()

	let age = $state(formatAge(new Date(birthDate), new Date(date)))

	function onAgeInput() {
		if (!age) {
			date = formatDate(new Date())
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

		const dateOfAge = new Date(birthDate)
		dateOfAge.setFullYear(birthDate.getFullYear() + ageNumber)

		date = formatDate(dateOfAge)
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
		dimension="compact"
		label={dateInputLabel}
		bind:value={date}
		class="grower"
	></DateInput>
	<Input
		type="number"
		variant="solid"
		dimension="compact"
		placeholder={agePlaceholder}
		label={ageLabel}
		unit={$_('years')}
		bind:value={age}
		class="grower"
		oninput={onAgeInput}
		step={1}
		min={0}
		onblur={checkAgeInput}
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
	.horizontal :global(.grower) {
		flex: 1;
	}
</style>
