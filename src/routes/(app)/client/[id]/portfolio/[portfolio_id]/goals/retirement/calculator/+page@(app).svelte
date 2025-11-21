<script lang="ts">
	import RetirementCalculator from '$lib/components/goals-retirement-calculator.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import { page } from '$app/state'
	import { clientStore } from '$lib/stores/clients.svelte'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import { goalCalculatorStore } from '$lib/stores/goal-calculator.svelte'
	import type { RetirementCalculationInput } from '$lib/@snaha/kalkul-calculators/retirement/retirement'

	const clientId = $derived(page.params.id)
	const client = $derived(clientStore.data.find((c) => c.id === clientId))
	const portfolioId = $derived(page.params.portfolio_id)
	const portfolio = $derived(portfolioStore.data.find((p) => p.id === portfolioId))

	function close() {
		if (client && portfolio) {
			goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))
		}
	}

	function handleCalculate(input: RetirementCalculationInput, currency: string) {
		// Save to temporary store
		goalCalculatorStore.setRetirementInput(input, currency)
		// Navigate to preview
		goto(routes.RETIREMENT_GOAL_PREVIEW(clientId, portfolioId))
	}
</script>

{#if client && portfolio}
	<Fullscreen>
		<RetirementCalculator
			{client}
			{portfolio}
			{close}
			onCalculate={handleCalculate}
			initialData={goalCalculatorStore.retirementInput}
		/>
	</Fullscreen>
{/if}
