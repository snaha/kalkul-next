<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHeader from './custom-header.svelte'
	let {
		children,
		hasCloseButton = true,
		beta = false,
	}: { children: Snippet; hasCloseButton?: boolean; beta?: boolean } = $props()
</script>

<CustomHeader {hasCloseButton} {beta} />
<div class="header-placeholder"></div>
<main>
	{@render children()}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100dvh - calc(var(--header-height) - var(--padding) - var(--double-padding));
		padding: var(--padding);
		padding-bottom: var(--double-padding);
		background-color: var(--colors-ultra-low);
	}
	.header-placeholder {
		display: flex;
		height: var(--header-height);
	}
	@media screen and (max-width: 760px) {
		main {
			min-height: 100dvh -
				calc(var(--header-height) - var(--double-padding) - var(--padding) - var(--double-padding));
		}
		.header-placeholder {
			height: calc(var(--header-height) - var(--double-padding) - var(--padding));
		}
	}
</style>
