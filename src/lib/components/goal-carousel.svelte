<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Typography from './ui/typography.svelte'
  import Vertical from './ui/vertical.svelte'

  type Calculator =
    | 'retirement'
    | 'kid-education'
    | 'item-purchase'
    | 'optimised-withdrawals'
    | 'house-buying'

  type Props = {
    onSelect: (calculator: Calculator) => void
  }

  const { onSelect }: Props = $props()
</script>

{#snippet card(name: Calculator, title: string, text: string, image: string, comingSoon = false)}
  <Vertical
    --vertical-gap="var(--padding)"
    --vertical-align-items="center"
    class="card"
    onclick={() => {
      if (!comingSoon) {
        onSelect?.(name)
      }
    }}
  >
    <img src={image} alt="card" />
    <Vertical --vertical-gap="var(--half-padding)">
      <Typography bold center>{title}</Typography>
      <Typography center>{text}</Typography>
    </Vertical>
    {#if comingSoon}
      <div class="overlay">
        <div class="coming-soon-badge">{$_('page.goals.calculators.comingSoon')}</div>
      </div>
    {/if}
  </Vertical>
{/snippet}
<div class="carousel">
  {@render card(
    'retirement',
    $_('page.goals.calculators.retirement.title'),
    $_('page.goals.calculators.retirement.description'),
    '/images/being-at-peace.svg',
  )}
  {@render card(
    'kid-education',
    $_('page.goals.calculators.kidEducation.title'),
    $_('page.goals.calculators.kidEducation.description'),
    '/images/education-graduation.svg',
  )}
  {@render card(
    'item-purchase',
    $_('page.goals.calculators.itemPurchase.title'),
    $_('page.goals.calculators.itemPurchase.description'),
    '/images/shopping-payment-with-card.svg',
    true,
  )}
  {@render card(
    'optimised-withdrawals',
    $_('page.goals.calculators.optimisedWithdrawals.title'),
    $_('page.goals.calculators.optimisedWithdrawals.description'),
    '/images/online-savings.svg',
    true,
  )}
  {@render card(
    'house-buying',
    $_('page.goals.calculators.houseBuying.title'),
    $_('page.goals.calculators.houseBuying.description'),
    '/images/house.svg',
    true,
  )}
</div>

<style>
  .carousel {
    display: flex;
    flex-direction: row;
    gap: var(--padding);
    padding-left: var(--double-padding);
    padding-right: var(--double-padding);
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 1952px;
  }
  .carousel :global(.card) {
    padding: var(--padding);
    min-width: 250px;
    max-width: 250px;
    min-height: 376px;
    background-color: var(--colors-base);
    border: 1px solid var(--colors-low);
    cursor: pointer;
    position: relative;
  }
  .carousel .card .overlay {
    position: absolute;
    top: 0;
    left: 0;
    min-width: 250px;
    min-height: 376px;
    z-index: 10;
    background-color: color-mix(in srgb, var(--colors-base) 75%, transparent);
    cursor: not-allowed;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 116px;
  }
  .coming-soon-badge {
    border: 1px solid var(--colors-high);
    color: var(--colors-high);
    background-color: var(--colors-base);
    border-radius: 20px;
    padding: 0.25rem 0.5rem;
    font: var(--font-family-sans-serif);
    font-weight: 800;
    font-size: 1rem;
    line-height: 24px;
    letter-spacing: 2%;
    user-select: none;
    text-transform: uppercase;
  }

  @media screen and (max-width: 1023px) {
    .carousel {
      padding-left: var(--padding);
      padding-right: var(--padding);
    }
  }
</style>
