<script lang="ts">
  import { page } from '$app/state'
  import { appStore } from '$lib/stores/app.svelte'
  import { withInvestmentsViewStore } from '$lib/stores/investments-view.svelte'
  import { deriveGraphValueData } from '$lib/graph'
  import PdfExport from '$lib/components/pdf-export.svelte'
  import Loader from '$lib/components/ui/loader.svelte'
  import Fullscreen from '$lib/components/fullscreen.svelte'
  import { _ } from 'svelte-i18n'
  import { getGraphDataForPortfolio } from '$lib/@snaha/kalkul-maths'
  import { getCSSVariableValue } from '$lib/css-vars'

  const clientId = $derived(page.params.id)
  const client = $derived(appStore.findClient(clientId))
  const portfolioId = $derived(page.params.portfolio_id)
  const portfolio = $derived(appStore.findPortfolio(portfolioId))

  // Read PDF export parameters from URL
  const searchParams = $derived(page.url.searchParams)
  const keyDates = $derived(
    searchParams
      .get('keyDates')
      ?.split(',')
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d.getTime())) || [],
  )
  const investments = $derived(appStore.getInvestments(portfolioId))

  const investmentsViewStore = $derived(
    withInvestmentsViewStore(appStore.getInvestments(portfolioId)),
  )

  let isLoading = $derived(appStore.loading)

  let adjustWithInflation = $state(false)
  const { total, data } = $derived(getGraphDataForPortfolio(investments, portfolio!))

  const lowColor = getCSSVariableValue('--colors-low')
  const baseColor = `${getCSSVariableValue('--colors-base')}cc`

  const graphValueData = $derived(
    portfolio && investments
      ? deriveGraphValueData({
          portfolio,
          investments,
          investmentsViewStore,
          total,
          data,
          lowColor,
          baseColor,
        })
      : undefined,
  )

  $effect(() => {
    investmentsViewStore.allInvestments = investments
  })
</script>

<svelte:head>
  <title>{portfolio?.name} - PDF Export</title>
  <style>
    @media print {
      @page {
        size: A4 landscape;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</svelte:head>

{#if isLoading || !graphValueData}
  <Fullscreen>
    <Loader />
  </Fullscreen>
{:else if !portfolio || !client}
  <Fullscreen>
    404 - {$_('common.notFound')}
  </Fullscreen>
{:else}
  <PdfExport
    {graphValueData}
    {adjustWithInflation}
    clientBirthDate={client.birth_date ? new Date(client.birth_date) : undefined}
    portfolioName={portfolio.name}
    clientName={client.name}
    {keyDates}
  />
{/if}
