<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		children: Snippet
	}
	let { children }: Props = $props()
</script>

<div class="vertical">
	{@render children()}
</div>

<style>
	:root {
		--vertical-gap: var(--padding);
		--vertical-justify-content: flex-start;
		--vertical-align-items: stretch;
	}
	.vertical {
		display: flex;
		flex-direction: column;
		justify-content: var(--vertical-justify-content);
		align-items: var(--vertical-align-items);
		gap: var(--vertical-gap);
	}
</style>
