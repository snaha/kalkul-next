<script lang="ts">
	import Badge from '../components/ui/badge.svelte'
	import { Growth } from 'carbon-icons-svelte'
	import type { Snippet } from 'svelte'

	type Props = {
		children?: Snippet
	}

	let { children = undefined }: Props = $props()
</script>

<Badge dimension="small" class="inflation-badge">
	<Growth size={16} />{@render children?.()}
</Badge>

<style>
	:global(.inflation-badge) {
		color: var(--colors-top) !important;
		background-color: var(--colors-base) !important;
	}
</style>
