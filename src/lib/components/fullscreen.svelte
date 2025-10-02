<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHeader from './custom-header.svelte'
	import Header from './header.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	let {
		children,
		hasCustomHeader = authStore.user ? false : true,
		hasCloseButton,
	}: {
		children: Snippet
		hasCustomHeader?: boolean
		hasCloseButton?: boolean
	} = $props()
</script>

{#if hasCustomHeader}
	<CustomHeader {hasCloseButton} />
{:else}
	<Header />
{/if}
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
	@media screen and (max-width: 760px) {
		main {
			min-height: 100dvh -
				calc(var(--header-height) - var(--double-padding) - var(--padding) - var(--double-padding));
		}
	}
</style>
