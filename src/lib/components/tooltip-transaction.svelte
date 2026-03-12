<script lang="ts">
  import { SERIES_COLORS } from '$lib/colors'
  import { formatCurrency } from '$lib/utils'
  import type { TooltipGraphProps } from './tooltip-base.svelte'
  import TooltipBase from './tooltip-base.svelte'
  import Divider from './ui/divider.svelte'
  import Typography from './ui/typography.svelte'
  import { _, locale } from 'svelte-i18n'
  interface Props extends TooltipGraphProps {
    adjustWithInflation: boolean
    showFees: boolean
    currency: string
    totalDeposits: number[]
    totalDepositsWithInflation: number[]
    totalWithdrawals: number[]
    totalWithdrawalsWithInflation: number[]
    totalFees: number[]
    totalFeesWithInflation: number[]
  }
  const {
    tooltipData,
    adjustWithInflation,
    showFees,
    currency,
    totalDeposits,
    totalDepositsWithInflation,
    totalWithdrawals,
    totalWithdrawalsWithInflation,
    totalFees,
    totalFeesWithInflation,
    ...restProps
  }: Props = $props()

  const deposits = $derived(tooltipData.filter((t) => t.type === 'transaction' && t.value > 0))
  const withdrawals = $derived(tooltipData.filter((t) => t.type === 'transaction' && t.value < 0))
</script>

<TooltipBase {tooltipData} {adjustWithInflation} {...restProps}>
  {#if deposits.length > 0}
    <Typography variant="h6" class="color-light">{$_('common.deposits')}</Typography>
    <div class="col">
      {#each deposits as deposit}
        <div class="investment-details">
          <div class="color-with-name">
            <div
              class="color-box"
              style={`background-color: ${SERIES_COLORS[deposit.colorIndex]}`}
            ></div>
            <Typography variant="small" class="color-light">{deposit.name}</Typography>
          </div>
          <Typography variant="small" class="color-light"
            >+{formatCurrency(deposit.value, currency, $locale, {
              maximumFractionDigits: 0,
            })}</Typography
          >
        </div>
      {/each}
    </div>
    {#if adjustWithInflation}
      <div class="col">
        <div class="total">
          <Typography class="color-light" variant="h6"
            >{$_('component.tooltipTransaction.totalDeposits')}</Typography
          >
          <Typography variant="h6" class="color-light"
            >{formatCurrency(
              totalDepositsWithInflation[tooltipData[0].dataIndex],
              currency,
              $locale,
              {
                maximumFractionDigits: 0,
              },
            )}</Typography
          >
        </div>
        <div class="total opacity">
          <Typography class="color-light" variant="small">{$_('common.nominal')}</Typography>
          <Typography variant="small" class="color-light"
            >{formatCurrency(totalDeposits[tooltipData[0].dataIndex], currency, $locale, {
              maximumFractionDigits: 0,
            })}</Typography
          >
        </div>
      </div>
    {:else}
      <div class="total">
        <Typography class="color-light" variant="h6"
          >{$_('component.tooltipTransaction.totalDeposits')}</Typography
        >
        <Typography variant="h6" class="color-light"
          >{formatCurrency(totalDeposits[tooltipData[0].dataIndex], currency, $locale, {
            maximumFractionDigits: 0,
          })}</Typography
        >
      </div>
    {/if}
  {/if}
  {#if deposits.length > 0 && withdrawals.length > 0}
    <Divider --margin="0" --divider-color="var(--colors-light-base)" style="opacity: 0.25" />
  {/if}
  {#if withdrawals.length > 0}
    <Typography variant="h6" class="color-light">{$_('common.withdrawals')}</Typography>
    <div class="col">
      {#each withdrawals as withdrawal}
        <div class="investment-details">
          <div class="color-with-name">
            <div
              class="color-box"
              style={`background-color: ${SERIES_COLORS[withdrawal.colorIndex]}`}
            ></div>
            <Typography variant="small" class="color-light">{withdrawal.name}</Typography>
          </div>
          <Typography variant="small" class="color-light"
            >{formatCurrency(withdrawal.value, currency, $locale, {
              maximumFractionDigits: 0,
            })}</Typography
          >
        </div>
      {/each}
    </div>
    {#if adjustWithInflation}
      <div class="col">
        <div class="total">
          <Typography class="color-light" variant="h6"
            >{$_('component.tooltipTransaction.totalWithdrawals')}</Typography
          >
          <Typography variant="h6" class="color-light"
            >{formatCurrency(
              totalWithdrawalsWithInflation[tooltipData[0].dataIndex],
              currency,
              $locale,
              {
                maximumFractionDigits: 0,
              },
            )}</Typography
          >
        </div>
        <div class="total opacity">
          <Typography class="color-light" variant="small">{$_('common.nominal')}</Typography>
          <Typography variant="small" class="color-light"
            >{formatCurrency(totalWithdrawals[tooltipData[0].dataIndex], currency, $locale, {
              maximumFractionDigits: 0,
            })}</Typography
          >
        </div>
      </div>
    {:else}
      <div class="total">
        <Typography class="color-light" variant="h6"
          >{$_('component.tooltipTransaction.totalWithdrawals')}</Typography
        >
        <Typography variant="h6" class="color-light"
          >{formatCurrency(totalWithdrawals[tooltipData[0].dataIndex], currency, $locale, {
            maximumFractionDigits: 0,
          })}</Typography
        >
      </div>
    {/if}
  {/if}
  {#if (deposits.length > 0 || withdrawals.length > 0) && showFees && totalFees[tooltipData[0].dataIndex] !== 0}
    <Divider --margin="0" --divider-color="var(--colors-light-base)" style="opacity: 0.25" />
  {/if}
  {#if showFees && totalFees[tooltipData[0].dataIndex] !== 0}
    {#if adjustWithInflation}
      <div class="col">
        <div class="total">
          <Typography class="color-light" variant="h6"
            >{$_('component.tooltipTransaction.totalFees')}</Typography
          >
          <Typography variant="h6" class="color-light"
            >{formatCurrency(totalFeesWithInflation[tooltipData[0].dataIndex], currency, $locale, {
              maximumFractionDigits: 0,
            })}</Typography
          >
        </div>
        <div class="total opacity">
          <Typography class="color-light" variant="small">{$_('common.nominal')}</Typography>
          <Typography variant="small" class="color-light"
            >{formatCurrency(totalFees[tooltipData[0].dataIndex], currency, $locale, {
              maximumFractionDigits: 0,
            })}</Typography
          >
        </div>
      </div>
    {:else}
      <div class="total">
        <Typography class="color-light" variant="h6"
          >{$_('component.tooltipTransaction.totalFees')}</Typography
        >
        <Typography variant="h6" class="color-light"
          >{formatCurrency(totalFees[tooltipData[0].dataIndex], currency, $locale, {
            maximumFractionDigits: 0,
          })}</Typography
        >
      </div>
    {/if}
  {/if}
</TooltipBase>

<style>
  .col {
    display: flex;
    flex-direction: column;
    gap: var(--half-padding);
  }
  .investment-details {
    display: flex;
    justify-content: space-between;
    gap: var(--half-padding);
  }
  .color-with-name {
    display: flex;
    gap: var(--quarter-padding);
  }
  .color-box {
    width: 24px;
    height: 16px;
    border-radius: var(--border-radius);
  }
  .total {
    display: flex;
    justify-content: space-between;
    gap: var(--half-padding);
  }
  .opacity {
    opacity: 50%;
  }
</style>
