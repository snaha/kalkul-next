<script lang="ts">
	import { Close } from 'carbon-icons-svelte'
	import { _, locale } from 'svelte-i18n'
	import { goto } from '$app/navigation'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import FormattedNumberInput from '$lib/components/ui/input/formatted-number/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import type { Client } from '$lib/types'
	import Select from '$lib/components/ui/select/select.svelte'
	import Divider from '$lib/components/ui/divider.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import ResponsiveLayout from '$lib/components/ui/responsive-layout.svelte'
	import DateAge from '$lib/components/date-age.svelte'
	import DatePicker from '$lib/components/ui/input/date/picker.svelte'
	import routes from '$lib/routes'
	import { addYears } from 'date-fns'
	import type { RetirementCalculationInput } from '$lib/demo/maths/retirement-calc'
	import { demoStore, RETIREMENT_DEFAULTS, type RetirementGoal } from '$lib/demo/stores/demo.svelte'

	type Props = {
		client: Client
		close: () => void
	}

	let { client, close }: Props = $props()

	// Calculate client's current age
	const birthDate = new Date(client.birth_date)
	const today = new Date()
	const currentAge = today.getFullYear() - birthDate.getFullYear()

	// Load existing data from store if available, otherwise use defaults
	const existingData = demoStore.goals[0] as RetirementGoal | undefined

	let clientAge = $state(currentAge)
	let retirementStart = $state(
		existingData?.calculationInput.retirementStart ??
			addYears(birthDate, RETIREMENT_DEFAULTS.RETIREMENT_AGE),
	)
	let retirementLength = $state(
		existingData?.calculationInput.retirementLength ?? RETIREMENT_DEFAULTS.RETIREMENT_LENGTH,
	)
	let currency = $state(existingData?.currency ?? RETIREMENT_DEFAULTS.CURRENCY)
	let inflation = $state(existingData?.calculationInput.inflation ?? RETIREMENT_DEFAULTS.INFLATION)
	let desiredBudget = $state<number>(
		existingData?.calculationInput.desiredBudget ?? RETIREMENT_DEFAULTS.DESIRED_BUDGET,
	)
	let budgetFrequency = $state(
		existingData?.calculationInput.budgetFrequency ?? RETIREMENT_DEFAULTS.BUDGET_FREQUENCY,
	)
	let currentSavings = $state<number>(
		existingData?.calculationInput.currentSavings ?? RETIREMENT_DEFAULTS.CURRENT_SAVINGS,
	)
	let apy = $state(existingData?.calculationInput.apy ?? RETIREMENT_DEFAULTS.APY)
	let depositFrequency = $state(
		existingData?.calculationInput.depositFrequency ?? RETIREMENT_DEFAULTS.DEPOSIT_FREQUENCY,
	)
	let depositStart = $state(existingData?.calculationInput.depositStart ?? today)

	function cancel(event: Event) {
		event.preventDefault()
		close()
	}

	function calculateDeposit() {
		try {
			const input: RetirementCalculationInput = {
				retirementStart,
				retirementLength,
				desiredBudget,
				budgetFrequency: budgetFrequency as 'month' | 'year',
				currentSavings,
				apy,
				inflation,
				depositStart,
				depositFrequency: depositFrequency as 'month' | 'year',
			}

			// Save calculation data to store
			const goal: RetirementGoal = {
				type: 'retirement',
				calculationInput: input,
				currency,
				linkedInvestments: demoStore.goals[0]?.linkedInvestments ?? [],
			}
			demoStore.goals[0] = goal

			// Navigate to preview page
			goto(routes.RETIREMENT_PREVIEW())
		} catch (error) {
			console.error('Calculation error:', error)
			// Navigate anyway on error
			goto(routes.RETIREMENT_PREVIEW())
		}
	}

	// DEMO: Keyboard listener to prefill form values for demonstration
	$effect(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'ArrowRight') {
				// DEMO PREFILL VALUES
				desiredBudget = 3500
				currentSavings = 11258
			}
		}

		window.addEventListener('keydown', handleKeydown)

		return () => {
			window.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<Vertical class="max-width-560">
	<Horizontal>
		<Typography variant="h4">{$_('page.retirement.title')}</Typography>
		<div class="grower"></div>
		<Button variant="ghost" dimension="compact" onclick={close}><Close size={24} /></Button>
	</Horizontal>
	<div class="spacer"></div>

	<Input
		type="number"
		variant="solid"
		dimension="compact"
		placeholder={$_('page.retirement.clientAgeToday')}
		label={$_('page.retirement.clientAgeToday')}
		unit={$_('page.retirement.yearsOld')}
		bind:value={clientAge}
		disabled
	></Input>

	<DateAge
		dimension="compact"
		dateInputLabel={$_('page.retirement.retirementStart')}
		bind:date={retirementStart}
		ageLabel={$_('page.retirement.retirementAge')}
		agePlaceholder={$_('page.retirement.retirementAge')}
		birthDate={new Date(client.birth_date)}
	/>

	<Input
		type="number"
		variant="solid"
		dimension="compact"
		placeholder={$_('page.retirement.retirementLength')}
		label={$_('page.retirement.retirementLength')}
		unit={$_('common.years')}
		bind:value={retirementLength}
	></Input>

	<Divider />

	<section class="horizontal">
		<Select
			variant="solid"
			dimension="compact"
			bind:value={currency}
			placeholder={$_('common.currency')}
			label={$_('common.currency')}
			class="grower"
			items={[
				{ value: 'EUR', label: 'EUR' },
				{ value: 'USD', label: 'USD' },
				{ value: 'CZK', label: 'CZK' },
			]}
		></Select>
		<Input
			type="number"
			variant="solid"
			dimension="compact"
			placeholder={$_('page.retirement.inflation')}
			label={$_('page.retirement.inflation')}
			unit="%"
			bind:value={inflation}
			step={'.01'}
			class="grower"
		></Input>
	</section>

	<section class="vertical-section">
		<section class="horizontal">
			<FormattedNumberInput
				variant="solid"
				dimension="compact"
				placeholder={$_('page.retirement.desiredRetirementBudget')}
				label={$_('page.retirement.desiredRetirementBudget')}
				unit={currency}
				bind:value={desiredBudget}
				locale={$locale}
				class="grower"
			/>
			<Select
				variant="solid"
				dimension="compact"
				bind:value={budgetFrequency}
				class="grower"
				items={[
					{ value: 'month', label: $_('page.retirement.perMonth') },
					{ value: 'year', label: $_('page.retirement.perYear') },
				]}
			></Select>
		</section>
		<Typography variant="small" class="helper-text"
			>{$_('page.retirement.inTodaysMoney')}</Typography
		>
	</section>

	<Divider />

	<section class="vertical-section">
		<section class="horizontal">
			<FormattedNumberInput
				variant="solid"
				dimension="compact"
				placeholder={$_('page.retirement.currentSavings')}
				label={$_('page.retirement.currentSavings')}
				unit={currency}
				bind:value={currentSavings}
				locale={$locale}
				class="grower"
			/>
			<Input
				type="number"
				variant="solid"
				dimension="compact"
				placeholder={$_('common.apy')}
				label={$_('common.apy')}
				unit="%"
				bind:value={apy}
				step={'.01'}
				class="grower"
			></Input>
		</section>
		<Typography variant="small" class="helper-text"
			>{$_('page.retirement.earmarkedForRetirement')}</Typography
		>
	</section>

	<section class="horizontal">
		<Select
			variant="solid"
			dimension="compact"
			bind:value={depositFrequency}
			placeholder={$_('page.retirement.depositFrequency')}
			label={$_('page.retirement.depositFrequency')}
			class="grower"
			items={[
				{ value: 'month', label: $_('page.retirement.monthly') },
				{ value: 'year', label: $_('page.retirement.yearly') },
			]}
		></Select>
		<DatePicker
			dimension="compact"
			label={$_('page.retirement.depositStart')}
			bind:value={depositStart}
			style="max-width: 100%"
		/>
	</section>

	<ResponsiveLayout --responsive-justify-content="stretch">
		<Button variant="strong" dimension="compact" onclick={calculateDeposit}
			>{$_('page.retirement.calculateDepositAmount')}</Button
		>
		<Button variant="ghost" dimension="compact" onclick={cancel}>{$_('common.cancel')}</Button>
	</ResponsiveLayout>
</Vertical>

<style>
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-end;
		gap: var(--half-padding);
	}
	.horizontal :global(.grower) {
		flex: 1;
		min-width: 0;
	}
	.spacer {
		margin-top: var(--half-padding);
	}
	.grower {
		flex: 1;
	}
	:global(.max-width-560) {
		max-width: 560px;
		width: 100%;
	}
	.horizontal :global(.grower .col),
	.horizontal :global(.grower .wrapper),
	.horizontal :global(.grower .relative),
	.horizontal :global(.grower input) {
		min-width: 0;
	}
	.horizontal :global(.date-picker) {
		flex: 1;
		min-width: 0;
		max-width: 100%;
	}
	.vertical-section {
		display: flex;
		flex-direction: column;
		gap: var(--quarter-padding);
	}
	.vertical-section :global(.helper-text) {
		color: var(--colors-medium);
		font-size: var(--font-size-small);
	}
</style>
