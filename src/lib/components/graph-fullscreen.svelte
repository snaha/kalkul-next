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
	import DesktopOnly from './desktop-only.svelte'

	type Props = {
		view?: boolean
		adjustWithInflation: boolean
		graphName: Snippet
		inflation: number
		fullscreen: () => void
		isSidebarOpen: boolean
		children: Snippet
		controls?: Snippet
		sidebarButton?: Snippet
		valueChanger?: Snippet
	}
	let {
		view = false,
		adjustWithInflation = $bindable(),
		graphName,
		inflation,
		fullscreen,
		isSidebarOpen = $bindable(),
		children,
		controls,
		sidebarButton,
		valueChanger,
	}: Props = $props()
</script>

<div class="fullscreen-graph" class:view>
	{#if view}
		<div class="row">
			<Button
				variant="ghost"
				dimension="small"
				onclick={() => {
					fullscreen()
				}}><ArrowLeft size={16} /></Button
			>
			<Typography variant="h5">{@render graphName()}</Typography>
			{@render valueChanger?.()}
		</div>
		<div class="row">
			{#if sidebarButton}
				{@render sidebarButton()}
			{/if}
			<Toggle
				label={$_('common.showInflation')}
				dimension="small"
				bind:checked={adjustWithInflation}
			></Toggle>
			{#if adjustWithInflation}
				<Badge dimension="small">{inflation * 100}%</Badge>
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
		<Horizontal --horizontal-gap="var(--half-padding)">
			{@render sidebarButton?.()}
			<DesktopOnly>
				<Typography variant="h5">{@render graphName()}</Typography>
			</DesktopOnly>
			{@render valueChanger?.()}
			<DesktopOnly>
				<Toggle
					label={$_('common.showInflation')}
					dimension="small"
					bind:checked={adjustWithInflation}
				></Toggle>
				{#if adjustWithInflation}
					<Badge dimension="small">{inflation * 100}%</Badge>
				{/if}
				<FlexItem />
			</DesktopOnly>
			{#if controls}
				{@render controls()}
			{/if}
			<DesktopOnly>
				<Button
					dimension="small"
					variant="ghost"
					onclick={() => {
						fullscreen()
					}}><Maximize size={16} /></Button
				>
			</DesktopOnly>
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
