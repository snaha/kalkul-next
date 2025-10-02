<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHeader from './custom-header.svelte'
	import Header from './header.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import ContentLayout from './content-layout.svelte'
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
<ContentLayout>
	{@render children()}
</ContentLayout>
