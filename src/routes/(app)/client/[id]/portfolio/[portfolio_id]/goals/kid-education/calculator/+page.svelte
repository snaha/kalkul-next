<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import type { PeriodicWithdrawalCalculationInput } from '$lib/@snaha/kalkul-calculators/periodic-withdrawal/periodic-withdrawal'
  import { goalDataToCalculationInput } from '$lib/@snaha/kalkul-calculators/periodic-withdrawal/periodic-withdrawal'
  import ContentLayout from '$lib/components/content-layout.svelte'
  import KidEducation from '$lib/components/goals-kid-education.svelte'
  import routes from '$lib/routes'
  import { clientStore } from '$lib/stores/clients.svelte'
  import { goalCalculatorStore } from '$lib/stores/goal-calculator.svelte'
  import { portfolioStore } from '$lib/stores/portfolio.svelte'
  import type { EducationGoalData } from '$lib/types'

  const clientId = $derived(page.params.id)
  const client = $derived(clientStore.data.find((c) => c.id === clientId))
  const portfolioId = $derived(page.params.portfolio_id)
  const portfolio = $derived(portfolioStore.data.find((p) => p.id === portfolioId))

  // Convert goalData to calculationInput for the calculator component
  const initialData = $derived(
    goalCalculatorStore.goalInput && goalCalculatorStore.goalInput.goalData.type === 'education'
      ? {
          calculationInput: goalDataToCalculationInput(goalCalculatorStore.goalInput.goalData),
          currency: goalCalculatorStore.goalInput.currency,
        }
      : undefined,
  )

  function close() {
    history.back()
  }

  function handleCalculate(
    input: PeriodicWithdrawalCalculationInput,
    currency: string,
    name: string,
    childName: string,
  ) {
    // Convert calculation input to goal data for storage
    const goalData: EducationGoalData = {
      type: 'education',
      name,
      childName,
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
    goto(routes.KID_EDUCATION_GOAL_PREVIEW(clientId, portfolioId))
  }
</script>

{#if client && portfolio}
  <ContentLayout>
    <KidEducation {client} {portfolio} {close} onCalculate={handleCalculate} {initialData} />
  </ContentLayout>
{/if}
