<script lang="ts">
	import type { Snippet } from 'svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Toggle from './ui/toggle.svelte'
	import Typography from './ui/typography.svelte'
	import Badge from './ui/badge.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import Button from './ui/button.svelte'
	import { ArrowLeft, Maximize } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'

	type Props = {
		view?: boolean
		adjustWithInflation: boolean
		hidden: boolean
		graphName: string
		infaltion: number
		fullscreen: () => void
		children: Snippet
		controls?: Snippet
		sidebarButton?: Snippet
	}
	let {
		view = false,
		adjustWithInflation = $bindable(),
		hidden,
		graphName,
		infaltion,
		fullscreen,
		children,
		controls,
		sidebarButton,
	}: Props = $props()
</script>

<div class="fullscreen-graph" class:hidden class:view>
	{#if view}
		<div class="row">
			<Button
				variant="ghost"
				dimension="small"
				onclick={() => {
					fullscreen()
				}}><ArrowLeft size={16} /></Button
			>
			<Typography variant="h5">{graphName}</Typography>
		</div>
		<div class="row">
			{#if sidebarButton}
				{@render sidebarButton()}
			{/if}
			<Toggle label={$_('Show inflation')} dimension="small" bind:checked={adjustWithInflation}
			></Toggle>
			{#if adjustWithInflation}
				<Badge dimension="small">{infaltion * 100}%</Badge>
			{/if}
		</div>
		<div class="row no-border">
			{#if controls}
				{@render controls()}
			{/if}
		</div>
		{#if children}
			{@render children()}
		{/if}
	{:else}
		<Horizontal --horizontal-gap="var(--half-padding)" --padding-left="42px">
			<Typography variant="h5">{graphName}</Typography>
			<Toggle label={$_('Show inflation')} dimension="small" bind:checked={adjustWithInflation}
			></Toggle>
			{#if adjustWithInflation}
				<Badge dimension="small">{infaltion * 100}%</Badge>
			{/if}
			<FlexItem />
			{#if controls}
				{@render controls()}
			{/if}
			<Button
				dimension="small"
				variant="ghost"
				onclick={() => {
					fullscreen()
				}}><Maximize size={16} /></Button
			>
		</Horizontal>
		{#if children}
			{@render children()}
		{/if}
	{/if}
</div>

<style>
	.fullscreen-graph {
		height: 100%;
		width: 100%;
		background-color: var(--colors-base);
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		padding: var(--padding);
		gap: var(--half-padding);
	}
	.hidden {
		display: none;
	}
	.view {
		gap: 0;
		padding: 0 var(--padding) var(--padding);
	}
	.row {
		display: flex;
		align-items: center;
		padding: var(--padding) 0;
		gap: var(--half-padding);
		border-bottom: 1px solid var(--colors-low);
	}
	.no-border {
		border: none;
	}
</style>
