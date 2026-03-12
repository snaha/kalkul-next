<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { goto } from '$app/navigation'
  import PeriodicWithdrawalPreview from '$lib/components/goals-periodic-withdrawal-preview.svelte'
  import Typography from '$lib/components/ui/typography.svelte'
  import {
    calculateRequiredDeposit,
    calculateWhatYouHave,
    generateYears,
    goalDataToCalculationInput,
  } from '$lib/@snaha/kalkul-calculators/periodic-withdrawal/periodic-withdrawal'
  import routes from '$lib/routes'
  import { page } from '$app/state'
  import { goalCalculatorStore } from '$lib/stores/goal-calculator.svelte'
  import { appStore } from '$lib/stores/app.svelte'
  import type { EducationGoalData } from '$lib/types'
  import { goalToTransactions } from '$lib/@snaha/kalkul-calculators/periodic-withdrawal/goal-transactions'
  import ContentLayout from '$lib/components/content-layout.svelte'
  import { onMount } from 'svelte'

  const clientId = $derived(page.params.id)
  const portfolioId = $derived(page.params.portfolio_id)

  // Get calculation data from store
  const calculatorData = $derived(goalCalculatorStore.goalInput)

  // Convert goal data to calculation input
  const calculationInput = $derived(
    calculatorData ? goalDataToCalculationInput(calculatorData.goalData) : undefined,
  )

  // Calculate required deposit
  const requiredDeposit = $derived(
    calculationInput ? calculateRequiredDeposit(calculationInput) : 0,
  )

  // Track deposit amount changes
  let depositAmount = $state(0)
  let desiredBudget = $state(0)

  onMount(() => {
    desiredBudget = calculatorData?.goalData.desiredBudget ?? 0
  })

  // Update deposit amount when goal changes
  $effect(() => {
    depositAmount = requiredDeposit
  })

  $effect(() => {
    if (
      calculatorData?.goalData &&
      calculatorData.goalData.desiredBudget !== desiredBudget &&
      desiredBudget
    ) {
      calculatorData.goalData.desiredBudget = desiredBudget
    }
  })

  // Ensure deposit amount is always a valid number
  const validDepositAmount = $derived(
    typeof depositAmount === 'number' && !isNaN(depositAmount) ? depositAmount : 0,
  )

  // Calculate data for charts
  const whatYouNeed = $derived(
    calculationInput ? calculateWhatYouHave(calculationInput, requiredDeposit) : [],
  )
  const whatYouHave = $derived(
    calculationInput ? calculateWhatYouHave(calculationInput, validDepositAmount) : [],
  )
  const years = $derived(
    calculationInput
      ? generateYears(
          calculationInput.depositStart,
          calculationInput.withdrawalStart,
          calculationInput.withdrawalDuration,
        )
      : [],
  )

  // Generate chart labels
  const chartLabels = $derived(() => {
    if (!years.length || !calculationInput) return []
    const startYear = years[0]
    const endYear = years[years.length - 1]
    const withdrawalStartYear = calculationInput.withdrawalStart.getFullYear()
    return years.map((year) => {
      if (year === startYear || year === endYear || year === withdrawalStartYear) {
        return year.toString()
      }
      return ''
    })
  })

  function close() {
    goalCalculatorStore.clearGoalInput()
    goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))
  }

  function goBack() {
    history.back()
  }

  function saveGoal(finalDepositAmount: number) {
    if (!calculatorData) return

    // Ensure deposit amount is valid (not NaN or undefined)
    const validFinalDepositAmount =
      typeof finalDepositAmount === 'number' && !isNaN(finalDepositAmount) ? finalDepositAmount : 0

    const goalData: EducationGoalData = {
      ...calculatorData.goalData,
      type: 'education',
      name:
        calculatorData.goalData.type === 'education'
          ? calculatorData.goalData.name
          : $_('page.education.defaultName'),
      childName:
        calculatorData.goalData.type === 'education' ? calculatorData.goalData.childName : '',
      customDepositAmount: validFinalDepositAmount,
    }

    // Create goal in database as an investment with goal_data
    const portfolio = appStore.findPortfolio(portfolioId)
    if (!portfolio) return

    const goalId = portfolio.addGoal({
      name: goalData.name, // Default name - can be edited later
      type: 'goal',
      apy: calculatorData.goalData.apy,
      goal_data: goalData,
      advanced_fees: false,
      entry_fee: 0,
      exit_fee: 0,
      management_fee: 0,
      ter: 0,
    })

    // Generate and create transactions for this goal
    const goalInvestment = appStore.findInvestment(goalId)
    if (goalInvestment) {
      const transactions = goalToTransactions(goalData, {
        initialSavings: $_('demo.transactions.initialSavings'),
        regularDeposit: $_('demo.transactions.regularDeposit'),
        withdrawal: $_('demo.transactions.educationWithdrawal'),
      })
      for (const transaction of transactions) {
        goalInvestment.addTransaction(transaction)
      }
    }

    // Navigate back to portfolio (before clearing state to avoid $effect redirect)
    goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId)).then(() => {
      // Clear temporary state after navigation
      goalCalculatorStore.clearGoalInput()
    })
  }
</script>

<ContentLayout>
  {#if calculatorData}
    <PeriodicWithdrawalPreview
      calculatedDeposit={requiredDeposit}
      currency={calculatorData.currency}
      frequency={calculatorData.goalData.budgetPeriod}
      bind:depositAmount
      bind:desiredBudget
      chartLabels={chartLabels()}
      whatYouNeedData={whatYouNeed}
      whatYouHaveData={whatYouHave}
      {close}
      {goBack}
      {saveGoal}
      labels={{
        pageTitle: $_('page.education.preview.title'),
        budgetLabel: $_('page.education.preview.budgetLabel'),
      }}
    />
  {:else}
    <Typography variant="h2">404 - {$_('common.notFound')}</Typography>
  {/if}
</ContentLayout>
