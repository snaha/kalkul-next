<script lang="ts">
  import { layoutStore } from '$lib/stores/layout.svelte'
  import { type Snippet } from 'svelte'

  type Props = {
    children: Snippet
  }

  let { children }: Props = $props()
</script>

{#if !layoutStore.mobile}
  {@render children()}
{/if}
