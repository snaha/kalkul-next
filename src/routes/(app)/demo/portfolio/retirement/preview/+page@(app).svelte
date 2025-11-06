<script lang="ts">
	import { _ } from 'svelte-i18n'
	import { goto } from '$app/navigation'
	import RetirementPreview from '$lib/demo/components/retirement-preview.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { demoStore, type RetirementGoal } from '$lib/demo/stores/demo.svelte'
	import {
		calculateRequiredDeposit,
		calculateWhatYouHave,
		generateYears,
	} from '$lib/@snaha/kalkul-calculators/retirement/retirement'
	import routes from '$lib/routes'
	import { DEMO_CLIENT_NAME, DEMO_CLIENT_BIRTH_DATE, DEMO_CLIENT_EMAIL } from '$lib/demo/utils'

	// Demo mode - use mock client matching Client type
	const client = {
		id: -1,
		name: DEMO_CLIENT_NAME,
		birth_date: DEMO_CLIENT_BIRTH_DATE,
		advisor: '',
		created_at: new Date().toISOString(),
		email: DEMO_CLIENT_EMAIL,
	}

	// Get retirement goal
	const goal = $derived(demoStore.goals[0] as RetirementGoal | undefined)

	// Ensure calculation data exists, otherwise redirect back
	$effect(() => {
		if (!goal) {
			goto(routes.RETIREMENT_CALCULATOR())
		}
	})

	// Calculate required deposit
	const requiredDeposit = $derived(goal ? calculateRequiredDeposit(goal.calculationInput) : 0)

	// Track deposit amount changes
	let depositAmount = $state(0)

	// Update deposit amount when goal changes
	$effect(() => {
		depositAmount = goal?.customDepositAmount ?? requiredDeposit
	})

	// Update store when deposit amount changes
	$effect(() => {
		demoStore.setCustomDepositAmount(depositAmount)
	})

	// Calculate data for charts
	const whatYouNeed = $derived(
		goal ? calculateWhatYouHave(goal.calculationInput, requiredDeposit) : [],
	)
	const whatYouHave = $derived(
		goal ? calculateWhatYouHave(goal.calculationInput, depositAmount) : [],
	)
	const years = $derived(
		goal
			? generateYears(
					goal.calculationInput.depositStart,
					goal.calculationInput.retirementStart,
					goal.calculationInput.retirementLength,
				)
			: [],
	)

	// Generate chart labels
	const chartLabels = $derived(() => {
		if (!years.length || !goal) return []
		const startYear = years[0]
		const endYear = years[years.length - 1]
		const retirementStartYear = goal.calculationInput.retirementStart.getFullYear()
		return years.map((year) => {
			if (year === startYear || year === endYear || year === retirementStartYear) {
				return year.toString()
			}
			return ''
		})
	})

	function close() {
		goto(routes.DEMO_TEMPLATES)
	}

	function goBack() {
		history.back()
	}

	function createPlan() {
		// Set demo state to 1 and populate data (goal only, no investments)
		demoStore.setState(1)
		// Navigate to demo page to create the plan
		goto(routes.DEMO())
	}
</script>

<Fullscreen>
	{#if client && goal}
		<RetirementPreview
			calculatedDeposit={requiredDeposit}
			currency={goal.currency}
			frequency={goal.calculationInput.budgetPeriod}
			bind:depositAmount
			chartLabels={chartLabels()}
			whatYouNeedData={whatYouNeed}
			whatYouHaveData={whatYouHave}
			{close}
			{goBack}
			{createPlan}
		/>
	{:else}
		<Typography variant="h2">404 - {$_('common.notFound')}</Typography>
	{/if}
</Fullscreen>
