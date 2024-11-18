<script lang="ts">
	import { onMount, setContext, type Snippet } from 'svelte'
	import { withTabStore, type TabStore } from './tab-store.svelte'
	import Button from '$lib/components/ui/button.svelte'

	type Dimension = 'default' | 'large' | 'compact' | 'small'
	type Props = {
		dimension?: Dimension
		children: Snippet
		ulClass?: string
		liClass?: string
		buttonClass?: string
		controls?: Snippet
		selectedTabIndex?: number
		selectedTabId?: string
	}

	let {
		dimension = 'default',
		children,
		ulClass,
		liClass,
		buttonClass,
		controls,
		selectedTabIndex = $bindable(),
		selectedTabId = $bindable(),
	}: Props = $props()

	const store = withTabStore()
	setContext<TabStore>('tab-store', store)

	function selectTab(i: number) {
		store.selected = i
		selectedTabIndex = i
		selectedTabId = store.ids[i]
	}

	onMount(() => {
		if (typeof selectedTabIndex === 'number') {
			selectTab(selectedTabIndex)
		} else if (typeof selectedTabId === 'string') {
			const index = store.ids.findIndex((id) => id === selectedTabId)
			if (index >= 0) {
				selectTab(index)
			} else {
				selectTab(0)
			}
		} else {
			selectTab(0)
		}
	})
</script>

<div class="tab-container">
	<ul class={ulClass}>
		{#each store.items as item, i}
			<li class={liClass}>
				{#if typeof item === 'string'}
					<Button
						class={buttonClass}
						variant="ghost"
						active={store.selected === i}
						{dimension}
						onclick={() => selectTab(i)}>{item}</Button
					>
				{:else}
					<Button
						class={buttonClass}
						variant="ghost"
						active={store.selected === i}
						{dimension}
						onclick={() => selectTab(i)}
					>
						{@render item()}
					</Button>
				{/if}
			</li>
		{/each}
		{#if controls}
			<div class="grower"></div>
			<div class="controls">
				{@render controls()}
			</div>
		{/if}
	</ul>

	<div class="tab-content">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	ul {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		gap: var(--half-padding);
		margin-top: 0px;
		margin-bottom: 0px;
		padding-left: unset;
		list-style: none;
	}
	.tab-container {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.tab-content {
		display: flex;
		flex-direction: column;
	}
	.grower {
		flex-grow: 1;
	}
	.controls {
		display: flex;
	}
</style>
