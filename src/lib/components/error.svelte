<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  const { children, ...restProps }: HTMLAttributes<HTMLDivElement> & { children: Snippet } =
    $props()
</script>

{#if children}
  <div class="error" {...restProps}>
    {@render children()}
  </div>
{/if}

<style>
  .error {
    display: inline-flex;
    align-items: center;
    gap: var(--half-padding);
    border: 1px solid var(--colors-top);
    border-radius: var(--border-radius);
    background: var(--colors-top);
    padding: var(--quarter-padding) var(--half-padding);
    color: var(--colors-base);
    font-family: var(--font-family-sans-serif);
    font-size: var(--font-size);
    line-height: var(--line-height);
    letter-spacing: var(--letter-spacing);
  }
</style>
