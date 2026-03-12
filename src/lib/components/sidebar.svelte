<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
    isGraphFullscreened?: boolean
    isSidebarOpen?: boolean
    isSidebarFlexible?: boolean
  }

  let { children, isGraphFullscreened, isSidebarOpen, isSidebarFlexible = false }: Props = $props()
</script>

<section
  class="sidebar vertical"
  class:fullscreen-graph={isGraphFullscreened}
  class:open={isSidebarOpen}
  class:fixed-width={!isSidebarFlexible}
>
  {@render children()}
</section>

<style>
  :root {
    --sidebar-width: 400px;
    --sidebar-gap: 0;
    --sidebar-padding: 0;
  }

  .vertical {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--sidebar-gap);
  }

  .sidebar {
    max-width: 100%;
    height: 100%;
    padding: var(--sidebar-padding);
    will-change: transform, width, opacity;
    transform: translateX(0);
    opacity: 1;
    content-visibility: visible;
    box-sizing: border-box;
  }

  .fullscreen-graph {
    transform: translateX(-100%);
    opacity: 0;
    width: 0;
    content-visibility: hidden;
    transition: transform 0.3s ease-in;
  }

  .fixed-width {
    width: var(--sidebar-width);
  }
  .open {
    opacity: 1;
    transform: translateX(0);
    content-visibility: visible;
    transition: transform 0.3s ease-in;
  }
</style>
