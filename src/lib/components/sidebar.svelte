<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		children: Snippet
	}

	let { children }: Props = $props()
</script>

<section class="sidebar vertical">
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
		min-width: var(--sidebar-width);
		height: 100%;
		padding: var(--sidebar-padding);
	}
</style>
