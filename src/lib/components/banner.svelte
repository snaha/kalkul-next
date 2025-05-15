<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	import Horizontal from '$lib/components/ui/horizontal.svelte'

	interface Props extends HTMLAttributes<HTMLDivElement> {
		icon: Snippet
		children: Snippet
	}

	const { icon, children, ...restProps }: Props = $props()
</script>

<Horizontal
	class="banner"
	--horizontal-gap="var(--half-padding)"
	--padding-left="var(--banner-padding)"
	--horizontal-justify-content="flex-start"
	--horizontal-align-items="center"
	{...restProps}
>
	<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
	<div style="color: var(--colors-high)">{@render icon()}</div>
	{@render children()}
</Horizontal>

<style>
	:root {
		--banner-border-radius: var(--quarter-padding);
		--banner-padding: var(--padding);
	}
	:global(.banner) {
		border-radius: var(--banner-border-radius);
		padding: var(--banner-padding);
		background-color: rgb(from var(--colors-high) r g b / 0.1);
		text-align: start;
	}
</style>
