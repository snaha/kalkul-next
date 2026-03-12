<script lang="ts">
  import type { InvestmentWithColorIndex, Portfolio, Transaction, Goal } from '$lib/types'
  import {
    Add,
    ArrowRight,
    CenterSquare,
    ChevronRight,
    Copy,
    OverflowMenuVertical,
    Settings,
    SettingsAdjust,
    TrashCan,
    ViewOff,
    WarningAltFilled,
  } from 'carbon-icons-svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Typography from '$lib/components/ui/typography.svelte'
  import { _ } from 'svelte-i18n'
  import Dropdown from '$lib/components/ui/dropdown.svelte'
  import List from '$lib/components/ui/list/list.svelte'
  import ListItem from '$lib/components/ui/list/list-item.svelte'
  import Horizontal from '$lib/components/ui/horizontal.svelte'
  import FlexItem from '$lib/components/ui/flex-item.svelte'
  import Vertical from '$lib/components/ui/vertical.svelte'
  import TransactionCard from '$lib/components/transaction-card.svelte'
  import Divider from '$lib/components/ui/divider.svelte'
  import { base } from '$app/paths'
  import { transactionStore } from '$lib/stores/transaction.svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Loader from '$lib/components/ui/loader.svelte'
  import DeleteModal from '$lib/components/delete-modal.svelte'
  import adapter from '$lib/adapters'
  import { SERIES_COLORS } from '$lib/colors'
  import InvestmentColorBox from './investment-color-box.svelte'
  import { type ExhaustionWarning } from '$lib/@snaha/kalkul-maths'
  import { goto } from '$app/navigation'

  type Props = {
    investment: InvestmentWithColorIndex
    portfolio: Portfolio
    viewOnly?: boolean
    index: number
    hidden: boolean
    focused: boolean
    showInflation?: boolean
    openTransaction?: (investment: InvestmentWithColorIndex, transaction?: Transaction) => void
    addInvestment?: () => void
    toggleHide: () => void
    toggleFocus: () => void
    open?: boolean
    exhaustionWarning?: ExhaustionWarning
    isCalculating?: boolean
    transactions?: Transaction[]
    goal: Goal
    showExplainInvestmentsLabel: boolean
  }

  let {
    investment,
    portfolio,
    viewOnly = false,
    index,
    hidden,
    focused,
    showInflation = false,
    openTransaction,
    addInvestment,
    toggleHide,
    toggleFocus,
    open = $bindable(false),
    exhaustionWarning,
    isCalculating = false,
    transactions: providedTransactions,
    goal,
    showExplainInvestmentsLabel,
  }: Props = $props()

  let transactionsOpen = $state(true)
  let linkedInvestmentsOpen = $state(true)
  let showDeleteGoalModal = $state(false)
  let selectedGoalIdForDeletion = $state<string | undefined>(undefined)

  const transactions = $derived(providedTransactions ?? transactionStore.filter(investment.id))
  // Linked investments will be implemented in Task 5
  const linkedInvestments = $derived<
    { investment?: InvestmentWithColorIndex; percentage: number }[]
  >([])

  function cardOpenInvestment(e: MouseEvent) {
    if (e.defaultPrevented) {
      return
    }
    toggleInvestment()
  }

  function toggleInvestment() {
    open = !open
  }

  function notImplemented(e: Event) {
    e.preventDefault()
    e.stopPropagation()
    alert($_('demo.notImplemented'))
  }

  async function deleteGoal(goalId: string) {
    await adapter.deleteInvestment({ id: goalId })
  }

  $effect(() => {
    // Reverse the color index for goals (use colors from the end of the array)
    investment.colorIndex = SERIES_COLORS.length - 1 - (index % SERIES_COLORS.length)
  })
</script>

<div
  class="card"
  role="button"
  tabindex="0"
  aria-expanded={open}
  onclick={cardOpenInvestment}
  onkeydown={(e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      e.preventDefault()
      toggleInvestment()
    }
  }}
  class:hidden
  class:open
>
  <Horizontal --horizontal-gap="var(--quarter-padding)">
    <div class="chevron">
      <ChevronRight
        size={20}
        class="open-investment-icon"
        color={hidden ? 'transparent' : undefined}
      />
    </div>
    <InvestmentColorBox colorIndex={investment.colorIndex ?? 0}>
      {#if isCalculating}
        <Vertical
          --vertical-justify-content="center"
          --vertical-align-items="center"
          style="min-height: 24px;"><Loader dimension="small" color="high" /></Vertical
        >
      {/if}
    </InvestmentColorBox>
    <Typography variant="h5" class="investment-name">{investment.name}</Typography>
    <FlexItem />
    {#if exhaustionWarning && !open}
      <Badge variant="error">
        <WarningAltFilled size={16} />
      </Badge>
    {/if}
    {#if open}
      <Badge>{investment.apy}% APY</Badge>
    {/if}
    {#if focused}
      <Button
        variant="ghost"
        dimension="compact"
        onclick={(e: Event) => {
          e.preventDefault()
          toggleFocus()
        }}><CenterSquare size={16} /></Button
      >
    {/if}
    {#if hidden}
      <Button
        class="show-investment-button"
        variant="ghost"
        dimension="compact"
        onclick={(e: Event) => {
          e.preventDefault()
          toggleHide()
        }}><ViewOff size={16} /></Button
      >
    {:else}
      <div class="dropdown">
        <Dropdown left buttonDimension="compact">
          {#snippet button()}
            <OverflowMenuVertical size={20} />
          {/snippet}
          <List>
            <ListItem onclick={notImplemented}
              ><CenterSquare size={24} />{focused
                ? $_('component.goalCard.removeFocus')
                : $_('component.goalCard.focusInChart')}</ListItem
            >
            <ListItem onclick={notImplemented}
              ><ViewOff size={24} />{$_('component.goalCard.hideInChart')}</ListItem
            >
            {#if !viewOnly}
              <ListItem onclick={notImplemented}
                ><Settings size={24} />{$_('component.goalCard.editGoalDetails')}</ListItem
              >
              <ListItem onclick={notImplemented}
                ><Copy size={24} />{$_('component.goalCard.duplicateGoal')}</ListItem
              >
              <ListItem
                onclick={() => {
                  selectedGoalIdForDeletion = investment.id
                  showDeleteGoalModal = true
                }}><TrashCan size={24} />{$_('component.goalCard.deleteGoal')}</ListItem
              >
            {/if}
          </List>
        </Dropdown>
      </div>
    {/if}
  </Horizontal>

  <div class="trasaction-container" class:modalShow={!open || hidden}>
    {#if transactions.length === 0}
      <Vertical --vertical-gap="var(--padding)">
        <Vertical --vertical-gap="var(--half-padding)" --vertical-align-items="center">
          <img src={`${base}/images/no-draft.svg`} alt={$_('common.noTransactionYet')} />
          <Typography variant="h5">{$_('component.investmentCard.noTransactions')}</Typography>
          {#if !viewOnly}
            <Typography variant="small"
              >{$_('component.investmentCard.noTransactionsText')}</Typography
            >
          {/if}
        </Vertical>
        {#if !viewOnly}
          <Horizontal --horizontal-justify-content="center"
            ><Button variant="strong" dimension="compact" onclick={notImplemented}
              >{$_('common.addTransaction')}</Button
            ></Horizontal
          >
        {/if}
      </Vertical>
    {:else}
      <div
        class="transactions-card"
        role="button"
        tabindex="0"
        aria-expanded={transactionsOpen || transactions.length === 0}
        class:transactions-open={transactionsOpen || transactions.length === 0}
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (transactions.length > 0) {
            transactionsOpen = !transactionsOpen
          }
        }}
        onkeydown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
            e.preventDefault()
            e.stopPropagation()
            if (transactions.length > 0) {
              transactionsOpen = !transactionsOpen
            }
          }
        }}
      >
        {#if transactions.length > 0}
          <Horizontal --horizontal-gap="var(--quarter-padding)">
            <Typography>{$_('common.transactions')}</Typography>
            <FlexItem />
          </Horizontal>
        {/if}
        <div class="transactions-content" class:transactions-hidden={!transactionsOpen}>
          <Vertical --vertical-gap="0">
            {#each transactions as transaction}
              <Divider --margin="0" />
              <TransactionCard
                {viewOnly}
                {showInflation}
                editTransaction={openTransaction
                  ? () => openTransaction(investment, transaction)
                  : undefined}
                {transaction}
                {portfolio}
                currency={portfolio.currency}
                exhaustionWarning={exhaustionWarning?.transactionIds.includes(transaction.id ?? -1)
                  ? exhaustionWarning
                  : undefined}
              />
            {/each}
          </Vertical>
        </div>
        <Horizontal --horizontal-justify-content="stretch"
          ><Button variant="ghost" dimension="compact" flexGrow onclick={notImplemented}
            >{$_('common.addTransaction')}</Button
          ></Horizontal
        >
      </div>
    {/if}
    <!-- Linked Investments Card - will be implemented in Task 5 -->
    {#if goal && linkedInvestments.length > 0}
      <div
        class="transactions-card"
        role="button"
        tabindex="0"
        aria-expanded={linkedInvestmentsOpen}
        class:transactions-open={linkedInvestmentsOpen}
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          linkedInvestmentsOpen = !linkedInvestmentsOpen
        }}
        onkeydown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
            e.preventDefault()
            e.stopPropagation()
            linkedInvestmentsOpen = !linkedInvestmentsOpen
          }
        }}
      >
        <Horizontal --horizontal-gap="var(--quarter-padding)">
          <div class="chevron">
            <ChevronRight size={16} class="transactions-chevron" />
          </div>
          <Typography>{$_('page.goals.linkedInvestments')}</Typography>
          <FlexItem />
          {#if addInvestment}
            <Button
              variant="ghost"
              dimension="compact"
              onclick={(e: Event) => {
                e.preventDefault()
                e.stopPropagation()
                addInvestment()
              }}
            >
              <Add size={20} />
            </Button>
          {/if}
          <Button variant="ghost" dimension="compact" onclick={notImplemented}>
            <SettingsAdjust size={20} />
          </Button>
        </Horizontal>
        <div class="transactions-content" class:transactions-hidden={!linkedInvestmentsOpen}>
          <Vertical --vertical-gap="0">
            {#each linkedInvestments as { investment: linkedInv, percentage }}
              {#if linkedInv}
                <Divider --margin="0" />
                <Horizontal --horizontal-gap="var(--half-padding)" class="linked-investment-row">
                  <Typography>{linkedInv.name}</Typography>
                  <FlexItem />
                  <Typography variant="small">{percentage.toFixed(0)}%</Typography>
                </Horizontal>
              {/if}
            {/each}
          </Vertical>
        </div>
      </div>
    {/if}
    {#if !viewOnly}
      <Vertical --vertical-gap="var(--half-padding)">
        {#if (transactions?.length ?? 0) > 0}
          <Horizontal>
            <Button
              dimension="compact"
              variant="ghost"
              onclick={(e: Event) => {
                e.preventDefault()
                e.stopPropagation()
                goto('#investments', { replaceState: true })
              }}
              flexGrow
            >
              Investments<ArrowRight size={20} />
            </Button>
          </Horizontal>
          {#if showExplainInvestmentsLabel}
            <Typography variant="small" center style="opacity: 0.5;">
              {$_('component.goalCard.explainInvestmentsText')}
            </Typography>
          {/if}
        {/if}
      </Vertical>
    {/if}
  </div>
</div>

<DeleteModal
  confirm={async () => {
    if (selectedGoalIdForDeletion) {
      await deleteGoal(selectedGoalIdForDeletion)
      selectedGoalIdForDeletion = undefined
      showDeleteGoalModal = false
    }
  }}
  oncancel={() => {
    showDeleteGoalModal = false
    selectedGoalIdForDeletion = undefined
  }}
  bind:open={showDeleteGoalModal}
  title={$_('component.goalCard.deleteGoalWarningTitle')}
  text={$_('component.goalCard.deleteGoalWarning')}
/>

<style type="postcss">
  .card {
    border: 1px solid var(--colors-low);
    border-radius: var(--double-border-radius);
    background-color: var(--colors-ultra-low);
    padding: var(--half-padding);
    display: flex;
    flex-direction: column;
    gap: var(--half-padding);
    cursor: pointer;
    transition: border 0.2s;
    transition-timing-function: ease-in;
    :global(.open-investment-icon) {
      transform: rotate(0deg);
      transition: transform 0.2s ease-out;
    }
    :global(.investment-name) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .dropdown {
    opacity: 1;
    transition: opacity 0.2s ease-out;
    visibility: visible;
  }
  .card:hover {
    border: 1px solid var(--colors-ultra-high);
    transition: border 0.2s;
    transition-timing-function: ease-out;
  }
  .chevron {
    padding: var(--half-padding);
    border: 1px solid transparent;
    display: flex;
  }
  .hidden {
    background-color: var(--colors-low);
    pointer-events: none;
    :global(.open-investment-icon) {
      opacity: 0.25;
    }
    :global(.show-investment-button) {
      pointer-events: all;
    }
    :global(.investment-name) {
      text-decoration: line-through;
    }
    :global(.investment-badge) {
      display: none;
    }
    &:hover {
      border: 1px solid var(--colors-low);
      transition: none;
    }
  }
  .card.open {
    :global(.open-investment-icon) {
      transform: rotate(90deg);
      transition: transform 0.2s ease-out;
    }
  }
  .trasaction-container {
    display: flex;
    flex-direction: column;
    gap: var(--half-padding);
    &.modalShow {
      display: none;
    }
  }
  .transactions-card {
    border: 1px solid var(--colors-low);
    border-radius: var(--double-border-radius);
    background-color: var(--colors-base);
    padding: var(--padding);
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    cursor: pointer;
    transition: border 0.2s;
    transition-timing-function: ease-in;
    :global(.transactions-chevron) {
      transform: rotate(0deg);
      transition: transform 0.2s ease-out;
    }
    &.transactions-open {
      :global(.transactions-chevron) {
        transform: rotate(90deg);
        transition: transform 0.2s ease-out;
      }
    }
    &:hover {
      border: 1px solid var(--colors-ultra-high);
      transition: border 0.2s;
      transition-timing-function: ease-out;
    }
  }
  .transactions-content {
    display: flex;
    flex-direction: column;
    gap: var(--half-padding);
    &.transactions-hidden {
      display: none;
    }
  }
  :global(.linked-investment-row) {
    padding: var(--half-padding);
    cursor: default;
  }
</style>
