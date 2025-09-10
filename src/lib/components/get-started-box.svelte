<script lang="ts">
	import { ChevronDown, ChevronRight } from 'carbon-icons-svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Typography from './ui/typography.svelte'
	import Vertical from './ui/vertical.svelte'
	import type { Snippet } from 'svelte'
	import Expander from './expander.svelte'

	type Props = {
		title: string
		text: Snippet
		children: Snippet
		expanded?: boolean
		id?: string
	}

	let { title, text, children, expanded = $bindable(true), id }: Props = $props()
</script>

<Vertical --vertical-gap="var(--padding)" --vertical-align-items="center" {id}>
	<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
		<Horizontal
			--horizontal-justify-content="stretch"
			class="pointer"
			onclick={() => (expanded = !expanded)}
		>
			{#if expanded}
				<ChevronDown size={24} />
			{:else}
				<ChevronRight size={24} />
			{/if}

			<Typography variant="h4">{title}</Typography>
			<div class="spacer"></div></Horizontal
		>
	</Vertical>
	<Expander horizontal={false} vertical bind:expanded>
		<Vertical --vertical-gap="var(--double-padding)" --vertical-align-items="center">
			<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
				{@render text()}
			</Vertical>
			{@render children()}
		</Vertical>
	</Expander>
</Vertical>

<style>
	:global(.max-560) {
		max-width: 560px;
		width: 100%;
	}
	:global(.text-center) {
		text-align: center;
	}
	:global(.pointer) {
		cursor: pointer;
	}
</style>
