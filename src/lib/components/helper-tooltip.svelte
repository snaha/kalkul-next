<script lang="ts">
  import { Information } from 'carbon-icons-svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Tooltip from '$lib/components/ui/tooltip.svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    show?: boolean
    helperText: string
    size?: 16 | 20 | 24 | 32
    position?: 'top' | 'bottom' | 'left' | 'right'
    icon?: Snippet<[{ size: 16 | 20 | 24 | 32 }]>
  }

  let {
    show = $bindable(false),
    helperText,
    size = 24,
    position = 'bottom',
    icon,
  }: Props = $props()
</script>

<Tooltip {show} {position} {helperText}
  ><Button
    dimension="compact"
    variant="ghost"
    onclick={(e: MouseEvent) => {
      e.stopPropagation()
      show = !show
    }}
    onmouseenter={() => (show = true)}
    onmouseleave={() => (show = false)}
  >
    {#if icon}
      {@render icon({ size })}
    {:else}
      <Information {size} />
    {/if}
  </Button></Tooltip
>
