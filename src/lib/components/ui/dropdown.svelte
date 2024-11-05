<script lang="ts">
	import Button from './button.svelte'
	import type { HTMLAttributes } from 'svelte/elements'
	import type { Dimension } from './button.svelte'
	import type { Snippet } from 'svelte'

	interface Props extends HTMLAttributes<HTMLDivElement> {
		dimension?: Dimension
		open?: boolean
		trigger: Snippet
	}
	let { children, trigger, open = false, dimension = 'default' }: Props = $props()

	$effect(() => {
		function closeMenu() {
			if (open) open = false
		}

		window.addEventListener('click', closeMenu)

		return () => {
			window.removeEventListener('click', closeMenu)
		}
	})
</script>

<div class="relative">
	<Button
		{dimension}
		variant="ghost"
		onclick={() => {
			if (!open)
				setTimeout(() => {
					open = true
				})
		}}
	>
		{#if trigger}
			{@render trigger()}
		{/if}
	</Button>
	<div class="dropdown" class:open>
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style lang="postcss">
	.relative {
		position: relative;
	}
	.dropdown {
		display: none;
		position: absolute;
		bottom: -0.25rem;
		left: 100%;
		flex-direction: column;
		gap: 1rem;
		transform: translate(-100%, 100%);
		z-index: 1;
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		background: var(--colors-base);
		padding: var(--padding);
		&.open {
			display: flex;
		}
	}
</style>
