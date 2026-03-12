<script lang="ts">
  import Typography from './ui/typography.svelte'
  import Horizontal from './ui/horizontal.svelte'
  import Logo from './icons/logo.svelte'
  import { _ } from 'svelte-i18n'

  interface Props {
    pageNumber: number
    totalPages: number
  }

  let { pageNumber, totalPages }: Props = $props()
</script>

<footer class="chart-footer">
  <Horizontal --horizontal-justify-content="space-between">
    <Horizontal --horizontal-gap="0">
      <Logo size="32" color="var(--colors-neutral)" />
      <Typography style="font-size: 10.66px; ; line-height: 13.325px;">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html $_('component.viewHeader.madeWithKalkul', {
          values: {
            link: '<a href="https://kalkul.app" style="color: black;" target="_blank" rel="noopener noreferrer">kalkul.app</a>',
          },
        })}
      </Typography>
    </Horizontal>

    <!-- Page indicator -->
    <Typography style="font-size: 10.66px; ; line-height: 13.325px;">
      {pageNumber} / {totalPages}
    </Typography>
  </Horizontal>
</footer>

<style>
  .chart-footer {
    flex-shrink: 0;
    margin-top: calc(var(--padding) * var(--print-multiplier));
    position: relative;
  }
</style>
