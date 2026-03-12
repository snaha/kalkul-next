<script lang="ts">
  import type { Snippet } from 'svelte'
  import CustomHeader from './custom-header.svelte'
  import Header from './header.svelte'
  import ContentLayout from './content-layout.svelte'
  let {
    children,
    hasCustomHeader = false,
    hasCloseButton,
    centerAlign = false,
  }: {
    children: Snippet
    hasCustomHeader?: boolean
    hasCloseButton?: boolean
    centerAlign?: boolean
  } = $props()
</script>

{#if hasCustomHeader}
  <CustomHeader {hasCloseButton} />
{:else}
  <Header />
{/if}
<ContentLayout {centerAlign}>
  {@render children()}
</ContentLayout>
