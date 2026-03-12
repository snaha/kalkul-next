<script lang="ts">
  import Button from '$lib/components/ui/button.svelte'
  import Typography from '$lib/components/ui/typography.svelte'
  import {
    ArrowLeft,
    ArrowRight,
    Copy,
    Edit,
    Folder,
    FolderAdd,
    FolderDetails,
    OverflowMenuVertical,
    TrashCan,
  } from 'carbon-icons-svelte'
  import { _, locale } from 'svelte-i18n'
  import { formatCurrency } from '$lib/utils'
  import { formatDate } from '$lib/@snaha/kalkul-maths/date'
  import Loader from '$lib/components/ui/loader.svelte'
  import { goto } from '$app/navigation'
  import routes from '$lib/routes'
  import { page } from '$app/state'
  import { appStore } from '$lib/stores/app.svelte'
  import Dropdown from '$lib/components/ui/dropdown.svelte'
  import List from '$lib/components/ui/list/list.svelte'
  import ListItem from '$lib/components/ui/list/list-item.svelte'
  import DeleteModal from '$lib/components/delete-modal.svelte'
  import { base } from '$app/paths'
  import { getCurrentPortfolioValue } from '$lib/@snaha/kalkul-maths'
  import {
    differenceInDays,
    differenceInMonths,
    differenceInWeeks,
    differenceInYears,
  } from 'date-fns'
  import type { Portfolio } from '$lib/types'
  import ContentLayout from '$lib/components/content-layout.svelte'
  import DesktopOnly from '$lib/components/desktop-only.svelte'
  import MobileOnly from '$lib/components/mobile-only.svelte'
  import { layoutStore } from '$lib/stores/layout.svelte'

  const clientId = page.params.id
  const client = $derived(appStore.findClient(clientId))
  const portfolios = $derived(appStore.getPortfolios(clientId))
  let showConfirmModal = $state(false)
  let portfolioToBeDeleted: string | undefined = $state()
  let showConfirmDeleteClientModal = $state(false)

  $effect(() => {
    if (!appStore.loading && !client) {
      goto(routes.HOME)
    }
  })

  function addPortfolio() {
    goto(routes.CLIENT_NEW_PORTFOLIO(clientId))
  }

  function confirmDeletePortfolio(portfolioId: string) {
    portfolioToBeDeleted = portfolioId
    showConfirmModal = true
  }

  function deletePortfolio() {
    if (!portfolioToBeDeleted) {
      return
    }

    appStore.deletePortfolio({ id: portfolioToBeDeleted })
    portfolioToBeDeleted = undefined
    showConfirmModal = false
  }

  function deleteClient() {
    appStore.deleteClient({ id: clientId })
    goto(routes.HOME)
  }

  function portfolioValue(portfolioId: string): number {
    const investments = appStore.getInvestments(portfolioId)
    return getCurrentPortfolioValue(
      { filter: (id: string) => appStore.getTransactions(id) },
      investments,
    )
  }

  function portfolioPeriod(portfolio: Portfolio) {
    const yearDiff = differenceInYears(portfolio.end_date, portfolio.start_date)
    if (yearDiff > 0) {
      return `${yearDiff}${$_('common.abbreviations.year')}`
    }
    const monthDiff = differenceInMonths(portfolio.end_date, portfolio.start_date)
    if (monthDiff > 0) {
      return `${monthDiff}${$_('common.abbreviations.month')}`
    }
    const weekDiff = differenceInWeeks(portfolio.end_date, portfolio.start_date)
    if (weekDiff > 0) {
      return `${weekDiff}${$_('common.abbreviations.week')}`
    }
    const dayDiff = differenceInDays(portfolio.end_date, portfolio.start_date)
    return `${dayDiff}${$_('common.abbreviations.day')}`
  }
</script>

{#snippet clientDropdown()}
  <Dropdown left buttonDimension="compact">
    {#snippet button()}
      <OverflowMenuVertical size={24} />
    {/snippet}
    <List>
      {#if layoutStore.mobile}
        <ListItem onclick={addPortfolio}
          ><FolderAdd size={24} />{$_('page.portfolio.addPortfolio')}</ListItem
        >
      {/if}
      <ListItem onclick={() => goto(routes.EDIT_CLIENT(clientId))}
        ><Edit size={24} />{$_('page.portfolio.editClient')}</ListItem
      >
      <ListItem onclick={() => (showConfirmDeleteClientModal = true)}
        ><TrashCan size={24} color="var(--colors-red)" /><Typography
          --typography-color="var(--colors-red)">{$_('common.deleteClient')}</Typography
        ></ListItem
      >
    </List>
  </Dropdown>
{/snippet}

{#snippet portfolioDropdown(portfolioId: string)}
  <Dropdown left buttonDimension="compact">
    {#snippet button()}
      <OverflowMenuVertical size={24} />
    {/snippet}
    <List>
      <ListItem onclick={() => goto(routes.CLIENT_PORTFOLIO(clientId, portfolioId))}
        ><Folder size={24} />{$_('page.portfolio.openPortfolio')}</ListItem
      >
      <ListItem onclick={() => goto(routes.CLIENT_EDIT_PORTFOLIO(clientId, portfolioId))}
        ><FolderDetails size={24} />{$_('page.portfolio.editPortfolioDetails')}</ListItem
      >
      <ListItem onclick={() => appStore.duplicatePortfolio(clientId, portfolioId)}
        ><Copy size={24} />{$_('page.portfolio.duplicatePortfolio')}</ListItem
      >
      <ListItem onclick={() => confirmDeletePortfolio(portfolioId)}
        ><TrashCan size={24} />{$_('page.portfolio.deletePortfolio')}</ListItem
      >
    </List>
  </Dropdown>
{/snippet}

{#if !client}
  <Loader />
{:else}
  <ContentLayout centered={false}>
    <section class="horizontal">
      <Button
        dimension="compact"
        variant="ghost"
        onclick={() => {
          goto(routes.HOME)
        }}
      >
        <ArrowLeft size={24} /></Button
      >
      <Typography variant="h4" nowrap>{client.name}</Typography>
      <div class="grower"></div>
      {#if !layoutStore.mobile}
        <Button variant="strong" dimension="compact" onclick={addPortfolio}
          >{$_('page.portfolio.addPortfolio')}</Button
        >
      {/if}
      {@render clientDropdown()}
    </section>
    {#if client}
      {#if appStore.loading}
        <Typography>{$_('common.loading')}</Typography><Loader />
      {:else if portfolios.length === 0}
        <section class="empty">
          <img src={`${base}/images/no-portfolio.svg`} alt={$_('common.noPortfolioYet')} />
          <div class="spacer"></div>
          <Typography variant="h4">{$_('page.client.noPortfoliosYet')}</Typography>
          <Typography>{$_('page.client.createYourFirstPortfolio')}</Typography>
          <div class="spacer"></div>
          <Button variant="strong" dimension="compact" onclick={addPortfolio}
            >{$_('page.portfolio.addPortfolio')}</Button
          >
        </section>
      {:else}
        <DesktopOnly>
          <ul>
            <li class="portfolios title">
              <span>{$_('common.portfolioName')}</span>
              <span>{$_('common.currency')}</span>
              <span>{$_('common.startDate')}</span>
              <span>{$_('common.period')}</span>
              <span class="right-aligned">{$_('common.inflation')}</span>
              <span class="right-aligned">{$_('common.currentValue')}</span>
              <span></span>
              <span></span>
            </li>
            {#each portfolios as portfolio}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
              <li
                class="portfolios portfolio"
                onclick={(e: MouseEvent) => {
                  if (!e.defaultPrevented) {
                    goto(routes.CLIENT_PORTFOLIO(clientId, portfolio.id))
                  }
                }}
              >
                <span>{portfolio.name}</span>
                <span>{portfolio.currency}</span>
                <span>{formatDate(new Date(portfolio.start_date))}</span>
                <span>{portfolioPeriod(portfolio)}</span>
                <span class="right-aligned">{portfolio.inflation_rate * 100}%</span>
                <span class="right-aligned"
                  >{formatCurrency(portfolioValue(portfolio.id), portfolio.currency, $locale, {
                    maximumFractionDigits: 0,
                  })}</span
                >
                <span class="right-aligned">{@render portfolioDropdown(portfolio.id)}</span>
              </li>
            {/each}
          </ul>
        </DesktopOnly>
        <MobileOnly>
          <ul class="mobile">
            {#each portfolios as portfolio}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
              <li
                class="portfolio mobile"
                onclick={(e: MouseEvent) => {
                  if (!e.defaultPrevented) {
                    goto(routes.CLIENT_PORTFOLIO(clientId, portfolio.id))
                  }
                }}
              >
                <span>{portfolio.name}</span>
                <span class="right-aligned"><ArrowRight /></span>
              </li>
            {/each}
          </ul>
          <Button variant="ghost" dimension="compact" onclick={addPortfolio}
            >{$_('page.portfolio.addPortfolio')}</Button
          >
        </MobileOnly>
      {/if}
    {/if}
  </ContentLayout>
{/if}

<DeleteModal
  confirm={deletePortfolio}
  oncancel={() => (showConfirmModal = false)}
  bind:open={showConfirmModal}
  title={$_('page.client.deletePortfolio')}
  text={$_('page.client.deletePortfolioWarning')}
/>

<DeleteModal
  confirm={deleteClient}
  oncancel={() => (showConfirmDeleteClientModal = false)}
  bind:open={showConfirmDeleteClientModal}
  title={$_('page.client.clientDelete')}
  text={$_('page.client.clientDeleteExplanation')}
/>

<style>
  :root {
    --max-width: 1370px;
  }
  .horizontal {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: var(--half-padding);
  }
  .grower {
    flex: 1;
  }
  ul {
    padding-left: 0;
    margin: 0;
  }
  ul.mobile {
    border-top: 1px solid var(--colors-low);
  }
  li > span {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--half-padding);
    overflow-wrap: anywhere;
  }
  .portfolios {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 42px;
    align-items: center;
    gap: var(--half-padding);
    border-bottom: 1px solid var(--colors-low);
    background-color: var(--colors-ultra-low);
    padding-top: var(--half-padding);
    padding-bottom: var(--half-padding);
    width: 100%;
  }
  .title {
    border-bottom: 1px solid var(--colors-ultra-high);
    color: var(--colors-ultra-high);
    font-size: var(--font-size-h5);
    font-family: var(--font-family-sans-serif);
    font-weight: 700;
  }
  .portfolio {
    border-bottom: 1px solid var(--colors-low);
    font-size: var(--font-size);
    font-family: var(--font-family-sans-serif);
    cursor: pointer;
  }
  .portfolio.mobile {
    display: flex;
    justify-content: space-between;
    padding: var(--padding) var(--half-padding);
    width: 100%;
    gap: var(--half-padding);
  }
  .portfolio:hover {
    background-color: color-mix(in srgb, var(--colors-low) 25%, transparent);
  }
  .right-aligned {
    display: flex;
    justify-content: flex-end;
    text-align: right;
  }
  .empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--half-padding);
    height: 80vh;
  }
  .spacer {
    margin-top: var(--half-padding);
  }
</style>
