<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHeader from './custom-header.svelte'
	let { children }: { children: Snippet } = $props()
</script>

<CustomHeader />
<main>
	{@render children()}
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100% - 106px);
		padding: var(--padding);
		padding-bottom: var(--double-padding);
	}
</style>
