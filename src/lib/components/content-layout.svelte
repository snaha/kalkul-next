<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		children: Snippet
		centered?: boolean
		centerAlign?: boolean
		centerVertical?: boolean
		class?: string
	}

	let {
		children,
		centered = true,
		centerAlign,
		centerVertical,
		class: className = '',
	}: Props = $props()
</script>

<main class:centered class:centerAlign class:centerVertical class={className}>
	{@render children()}
</main>

<style lang="postcss">
	:root {
		--content-layout-margin: 0;
	}
	main {
		display: flex;
		flex-direction: column;
		gap: var(--gap, var(--double-padding));
		margin: var(--content-layout-margin);
		padding: var(--double-padding);
		width: 100%;
		max-width: 1952px;

		&.centerAlign {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}
	.centered {
		justify-content: center;
		align-items: center;
	}
	@media screen and (max-width: 1023px) {
		main {
			padding: var(--padding);
		}
	}
</style>
