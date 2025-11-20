<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	type Props = {
		children: Snippet
		class?: string
		element?: HTMLElement
	}
	let {
		children,
		class: className = '',
		element = $bindable(),
		...restProps
	}: Props & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div class="vertical {className}" {...restProps} bind:this={element}>
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
