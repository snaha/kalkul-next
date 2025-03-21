<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		children: Snippet
		isGraphFullscreened?: boolean
		isSidebarOpen?: boolean
	}

	let { children, isGraphFullscreened, isSidebarOpen }: Props = $props()
</script>

<section
	class="sidebar vertical"
	class:fullscreen-graph={isGraphFullscreened}
	class:open={isSidebarOpen}
>
	{@render children()}
</section>

<style>
	:root {
		--sidebar-width: 360px;
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
		width: var(--sidebar-width);
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

	.open {
		width: var(--sidebar-width);
		opacity: 1;
		transform: translateX(0);
		content-visibility: visible;
		transition: transform 0.3s ease-in;
	}
	.fullscreen-graph.open {
		padding-top: 66px;
	}
</style>
