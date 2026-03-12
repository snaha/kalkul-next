<script lang="ts">
  import { page } from '$app/state'
  import EditInvestment from '$lib/components/edit-investment.svelte'
  import Fullscreen from '$lib/components/fullscreen.svelte'
  import Loader from '$lib/components/ui/loader.svelte'
  import Typography from '$lib/components/ui/typography.svelte'
  import { appStore } from '$lib/stores/app.svelte'
  import { _ } from 'svelte-i18n'

  const portfolioId = $derived(page.params.portfolio_id)
  const investmentId = $derived(page.params.investment_id)
  const portfolio = $derived(appStore.findPortfolio(portfolioId))
  const investment = $derived(appStore.findInvestment(investmentId))

  function close() {
    history.back()
  }
</script>

<Fullscreen>
  {#if appStore.loading}
    <Loader />
  {:else if portfolio && investment}
    <EditInvestment {close} {portfolio} {investment} />
  {:else}
    <Typography variant="h2">404 - {$_('common.notFound')}</Typography>
  {/if}
</Fullscreen>
