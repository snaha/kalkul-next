<script lang="ts">
	import { Subtract, Add } from 'carbon-icons-svelte'
	import Expander from './expander.svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Typography from './ui/typography.svelte'
	import Vertical from './ui/vertical.svelte'
	import type { Snippet } from 'svelte'

	type Props = {
		title: string
		children: Snippet
	}

	let { title, children }: Props = $props()

	let expanded = $state(false)
</script>

<Vertical
	class="gray"
	--vertical-align-items="stretch"
	--vertical-gap="0"
	onclick={() => (expanded = !expanded)}
>
	<Horizontal --horizontal-gap="0" --horizontal-justify-content="stretch">
		<Typography variant="large">FAQ:&nbsp;</Typography>
		<Typography variant="h4">{title}</Typography>
		<div class="spacer"></div>
		{#if expanded}
			<Subtract size={32} />
		{:else}
			<Add size={32} />
		{/if}
	</Horizontal>
	<Expander bind:expanded horizontal={false} vertical={true}>
		<div class="faq-content">
			{@render children()}
		</div>
	</Expander>
</Vertical>

<style>
	:global(.gray) {
		background-color: var(--colors-low);
		border-radius: var(--half-padding);
		padding: var(--padding);
		cursor: pointer;
		width: 100%;
	}
	.spacer {
		flex: 1;
	}
	.faq-content {
		display: flex;
		flex-direction: column;
		padding-top: var(--padding) !important;
		gap: var(--padding);
	}
</style>
