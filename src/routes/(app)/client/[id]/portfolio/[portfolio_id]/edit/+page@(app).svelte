<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { page } from '$app/state'
  import EditPortfolio from '$lib/components/edit-portfolio.svelte'
  import Fullscreen from '$lib/components/fullscreen.svelte'
  import Typography from '$lib/components/ui/typography.svelte'
  import { appStore } from '$lib/stores/app.svelte'

  const clientId = page.params.id
  const client = $derived(appStore.findClient(clientId))
  const portfolioId = page.params.portfolio_id
  const portfolio = $derived(client?.portfolios.find((p) => p.id === portfolioId))

  function close() {
    history.back()
  }
</script>

<Fullscreen>
  {#if client && portfolio}
    <EditPortfolio {close} {client} {portfolio} />
  {:else}
    <Typography variant="h2">404 - {$_('common.notFound')}</Typography>
  {/if}
</Fullscreen>
