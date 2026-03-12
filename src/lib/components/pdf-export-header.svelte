<script lang="ts">
  import { locale } from 'svelte-i18n'
  import Typography from './ui/typography.svelte'
  import Vertical from './ui/vertical.svelte'
  import Horizontal from './ui/horizontal.svelte'
  import QrCode from '@castlenine/svelte-qrcode'

  interface Props {
    portfolioName: string
    viewLink?: string
  }

  let { portfolioName, viewLink }: Props = $props()

  const formattedDate = $derived(new Date().toLocaleDateString($locale ?? undefined))
</script>

<header class="page-header">
  <Horizontal --horizontal-alignment="center" --horizontal-gap="var(--half-padding)">
    {#if viewLink}
      <QrCode data={viewLink} size={64} backgroundColor="white" />
    {/if}
    <Horizontal --horizontal-gap={viewLink ? 'var(--half-padding)' : '0'}>
      <Vertical --vertical-gap="0">
        <Typography bold style="font-size: 18.655px; line-height: 24px;">
          {portfolioName}
        </Typography>
        {#if viewLink}
          <Typography variant="small" style="font-size: 10.66px; ; line-height: 13.325px;">
            <a href={viewLink} class="view-link" target="_blank">{viewLink}</a>
          </Typography>
        {/if}
      </Vertical>
    </Horizontal>
    <div style="flex: 1;"></div>
    <Horizontal --horizontal-gap="0" --horizontal-alignment="center">
      <Typography style="font-size: 10.66px; ; line-height: 13.325px;">
        {formattedDate}
      </Typography>
    </Horizontal>
  </Horizontal>
</header>

<style>
  .page-header {
    flex-shrink: 0;
    margin-bottom: calc(var(--padding) * var(--print-multiplier));
  }

  .view-link {
    color: black;
    text-decoration: underline;
  }
</style>
