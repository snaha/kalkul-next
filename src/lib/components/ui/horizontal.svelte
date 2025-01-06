<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		children: Snippet
	}
	let { children }: Props = $props()
</script>

<div class="horizontal">
	{@render children()}
</div>

<style>
	:root {
		--horizontal-gap: var(--padding);
		--horizontal-justify-content: flex-start;
		--horizontal-align-items: center;
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: var(--horizontal-justify-content);
		align-items: var(--horizontal-align-items);
		gap: var(--horizontal-gap);
	}
</style>
