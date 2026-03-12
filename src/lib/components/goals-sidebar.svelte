<script lang="ts">
  import Button from '$lib/components/ui/button.svelte'
  import type {
    EnrichedInvestment,
    EnrichedTransaction,
    GoalData,
    InvestmentWithColorIndex,
    PortfolioNested,
  } from '$lib/types'
  import { _ } from 'svelte-i18n'
  import Sidebar from './sidebar.svelte'
  import GoalCard from './goal-card.svelte'
  import Vertical from '$lib/components/ui/vertical.svelte'
  import type { PortfolioSimulation } from '$lib/stores/portfolio-simulation.svelte'
  import FlexItem from './ui/flex-item.svelte'
  import Typography from './ui/typography.svelte'
  import { base } from '$app/paths'
  import Horizontal from './ui/horizontal.svelte'

  type Props = {
    isGraphFullscreened: boolean
    isSidebarOpen: boolean
    isSidebarFlexible: boolean
    portfolio: PortfolioNested
    goals: (EnrichedInvestment & { goal_data: GoalData })[]
    adjustWithInflation: boolean
    viewOnly: boolean
    graphData?: PortfolioSimulation
    openTransaction?: (
      investment: InvestmentWithColorIndex,
      transaction?: EnrichedTransaction,
    ) => void
    addGoal: () => void
    showExplainInvestmentsLabel: boolean
  }

  let {
    isGraphFullscreened,
    isSidebarOpen = $bindable(),
    isSidebarFlexible,
    portfolio,
    goals,
    adjustWithInflation,
    viewOnly,
    graphData,
    openTransaction,
    addGoal,
    showExplainInvestmentsLabel,
  }: Props = $props()
</script>

<Sidebar
  --sidebar-gap="var(--half-padding)"
  --sidebar-padding="0"
  {isGraphFullscreened}
  {isSidebarOpen}
  {isSidebarFlexible}
>
  <Vertical
    --vertical-gap="var(--half-padding)"
    --vertical-justify-content="start"
    class="investments"
  >
    {#if goals.length === 0}
      <FlexItem />
      <Vertical
        --vertical-gap="var(--padding)"
        --vertical-align-items="center"
        --vertical-justify-content="center"
      >
        <Vertical --vertical-gap="var(--half-padding)">
          <img
            src={`${base}/images/no-transaction.svg`}
            alt={$_('component.sidebar.noGoalsYetTitle')}
          />
          <Typography variant="h5">{$_('component.sidebar.noGoalsYetTitle')}</Typography>
          {#if !viewOnly}
            <Typography variant="small" center
              >{$_('component.sidebar.noGoalsYetDescription')}</Typography
            >
          {/if}
        </Vertical>
        {#if !viewOnly}
          <Horizontal --horizontal-justify-content="center"
            ><Button variant="strong" dimension="compact" onclick={addGoal}
              >{$_('page.portfolio.addGoal')}</Button
            ></Horizontal
          >
        {/if}
      </Vertical>
      <FlexItem />
    {/if}
    {#each goals as goal, i}
      <GoalCard
        investment={goal}
        {portfolio}
        {viewOnly}
        index={i}
        showInflation={adjustWithInflation}
        {openTransaction}
        addInvestment={addGoal}
        open={true}
        exhaustionWarning={graphData?.data[i]?.exhaustionWarning}
        isCalculating={graphData?.isCalculating &&
          (!graphData.currentCalculatingIndex || i >= graphData.currentCalculatingIndex)}
        {goal}
        {showExplainInvestmentsLabel}
      />
    {/each}
  </Vertical>
</Sidebar>

<style>
  :global(.investments) {
    background-color: var(--colors-low);
    border-radius: var(--half-padding);
    min-height: var(--sidebar-min-height);
    padding-left: var(--half-padding);
    padding-right: var(--half-padding);
  }
</style>
