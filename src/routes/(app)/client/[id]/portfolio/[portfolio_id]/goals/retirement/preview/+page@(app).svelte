<script lang="ts">
	import { _ } from 'svelte-i18n'
	import { goto } from '$app/navigation'
	import RetirementPreview from '$lib/components/goals-retirement-preview.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import {
		calculateRequiredDeposit,
		calculateWhatYouHave,
		generateYears,
	} from '$lib/@snaha/kalkul-calculators/retirement/retirement'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import { goalCalculatorStore } from '$lib/stores/goal-calculator.svelte'
	import adapter from '$lib/adapters'
	import type { RetirementGoalData } from '$lib/types'
	import { retirementGoalToTransactions } from '$lib/@snaha/kalkul-calculators/retirement/goal-transactions'

	const clientId = $derived(page.params.id)
	const portfolioId = $derived(page.params.portfolio_id)

	// Get calculation data from store
	const calculatorData = $derived(goalCalculatorStore.retirementInput)

	// Ensure calculation data exists, otherwise redirect back
	$effect(() => {
		if (!calculatorData) {
			goto(routes.RETIREMENT_GOAL_CALCULATOR(clientId, portfolioId))
		}
	})

	// Calculate required deposit
	const requiredDeposit = $derived(
		calculatorData ? calculateRequiredDeposit(calculatorData.calculationInput) : 0,
	)

	// Track deposit amount changes
	let depositAmount = $state(0)

	// Update deposit amount when goal changes
	$effect(() => {
		depositAmount = requiredDeposit
	})

	// Ensure deposit amount is always a valid number
	const validDepositAmount = $derived(
		typeof depositAmount === 'number' && !isNaN(depositAmount) ? depositAmount : 0,
	)

	// Calculate data for charts
	const whatYouNeed = $derived(
		calculatorData ? calculateWhatYouHave(calculatorData.calculationInput, requiredDeposit) : [],
	)
	const whatYouHave = $derived(
		calculatorData ? calculateWhatYouHave(calculatorData.calculationInput, validDepositAmount) : [],
	)
	const years = $derived(
		calculatorData
			? generateYears(
					calculatorData.calculationInput.depositStart,
					calculatorData.calculationInput.retirementStart,
					calculatorData.calculationInput.retirementLength,
				)
			: [],
	)

	// Generate chart labels
	const chartLabels = $derived(() => {
		if (!years.length || !calculatorData) return []
		const startYear = years[0]
		const endYear = years[years.length - 1]
		const retirementStartYear = calculatorData.calculationInput.retirementStart.getFullYear()
		return years.map((year) => {
			if (year === startYear || year === endYear || year === retirementStartYear) {
				return year.toString()
			}
			return ''
		})
	})

	function close() {
		goalCalculatorStore.clearRetirementInput()
		goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))
	}

	function goBack() {
		goto(routes.RETIREMENT_GOAL_CALCULATOR(clientId, portfolioId))
	}

	async function saveGoal(finalDepositAmount: number) {
		if (!calculatorData) return

		// Ensure deposit amount is valid (not NaN or undefined)
		const validFinalDepositAmount =
			typeof finalDepositAmount === 'number' && !isNaN(finalDepositAmount) ? finalDepositAmount : 0

		// Create goal_data matching RetirementGoalData type
		const goalData: RetirementGoalData = {
			type: 'retirement',
			depositStart: calculatorData.calculationInput.depositStart.toISOString(),
			depositPeriod: calculatorData.calculationInput.depositPeriod,
			currentSavings: calculatorData.calculationInput.currentSavings,
			customDepositAmount: validFinalDepositAmount,
			retirementStart: calculatorData.calculationInput.retirementStart.toISOString(),
			retirementLength: calculatorData.calculationInput.retirementLength,
			desiredBudget: calculatorData.calculationInput.desiredBudget,
			budgetPeriod: calculatorData.calculationInput.budgetPeriod,
			apy: calculatorData.calculationInput.apy,
			inflation: calculatorData.calculationInput.inflation,
		}

		// Create goal in database as an investment with goal_data
		const goalId = await adapter.addGoal({
			portfolio_id: portfolioId,
			name: $_('demo.investments.retirement'), // Default name - can be edited later
			type: 'goal',
			apy: calculatorData.calculationInput.apy,
			goal_data: goalData,
			// Set default fees to 0 (null is allowed for database/SQL fields)
			advanced_fees: false,
			entry_fee: 0,
			entry_fee_type: null,
			exit_fee: 0,
			exit_fee_type: null,
			management_fee: 0,
			management_fee_type: null,
			ter: 0,
			success_fee: null,
		})

		// Generate and create transactions for this goal
		const transactions = retirementGoalToTransactions(goalData, goalId, {
			initialSavings: $_('demo.transactions.initialSavings'),
			regularDeposit: $_('demo.transactions.regularDeposit'),
			retirementWithdrawal: $_('demo.transactions.retirementWithdrawal'),
		})
		for (const transaction of transactions) {
			await adapter.addTransaction(transaction)
		}

		// Navigate back to portfolio first (before clearing state to avoid $effect redirect)
		await goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))

		// Clear temporary state after navigation
		goalCalculatorStore.clearRetirementInput()
	}
</script>

<Fullscreen>
	{#if calculatorData}
		<RetirementPreview
			calculatedDeposit={requiredDeposit}
			currency={calculatorData.currency}
			frequency={calculatorData.calculationInput.budgetPeriod}
			bind:depositAmount
			chartLabels={chartLabels()}
			whatYouNeedData={whatYouNeed}
			whatYouHaveData={whatYouHave}
			{close}
			{goBack}
			{saveGoal}
		/>
	{:else}
		<Typography variant="h2">404 - {$_('common.notFound')}</Typography>
	{/if}
</Fullscreen>
