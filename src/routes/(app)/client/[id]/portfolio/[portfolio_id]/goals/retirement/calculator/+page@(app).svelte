<script lang="ts">
  import RetirementCalculator from '$lib/components/goals-retirement-calculator.svelte'
  import Fullscreen from '$lib/components/fullscreen.svelte'
  import { page } from '$app/state'
  import { clientStore } from '$lib/stores/clients.svelte'
  import { portfolioStore } from '$lib/stores/portfolio.svelte'
  import { goto } from '$app/navigation'
  import routes from '$lib/routes'
  import { goalCalculatorStore } from '$lib/stores/goal-calculator.svelte'
  import type { PeriodicWithdrawalCalculationInput } from '$lib/@snaha/kalkul-calculators/periodic-withdrawal/periodic-withdrawal'
  import { goalDataToCalculationInput } from '$lib/@snaha/kalkul-calculators/periodic-withdrawal/periodic-withdrawal'
  import type { RetirementGoalData } from '$lib/types'

  const clientId = $derived(page.params.id)
  const client = $derived(clientStore.data.find((c) => c.id === clientId))
  const portfolioId = $derived(page.params.portfolio_id)
  const portfolio = $derived(portfolioStore.data.find((p) => p.id === portfolioId))

  // Convert goalData to calculationInput for the calculator component
  const initialData = $derived(
    goalCalculatorStore.goalInput && goalCalculatorStore.goalInput.goalData.type === 'retirement'
      ? {
          calculationInput: goalDataToCalculationInput(goalCalculatorStore.goalInput.goalData),
          currency: goalCalculatorStore.goalInput.currency,
        }
      : undefined,
  )

  function close() {
    history.back()
  }

  function handleCalculate(input: PeriodicWithdrawalCalculationInput, currency: string) {
    // Convert calculation input to goal data for storage
    const goalData: RetirementGoalData = {
      type: 'retirement',
      depositStart: input.depositStart.toISOString(),
      depositPeriod: input.depositPeriod,
      currentSavings: input.currentSavings,
      withdrawalStart: input.withdrawalStart.toISOString(),
      withdrawalDuration: input.withdrawalDuration,
      desiredBudget: input.desiredBudget,
      budgetPeriod: input.budgetPeriod,
      apy: input.apy,
      inflation: input.inflation,
    }
    // Save to temporary store
    goalCalculatorStore.setGoalInput(goalData, currency)
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
      {initialData}
    />
  </Fullscreen>
{/if}
