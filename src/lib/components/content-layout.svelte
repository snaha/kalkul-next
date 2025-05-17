<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		children: Snippet
		centerAlign?: boolean
		centerVertical?: boolean
	}

	let { children, centerAlign, centerVertical }: Props = $props()
</script>

<main class="centered" class:centerAlign class:centerVertical>
	{@render children()}
</main>

<style lang="postcss">
	:root {
		--content-layout-margin: auto;
	}
	.centered {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--gap, --padding);
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
	@media screen and (max-width: 1023px) {
		.centered {
			padding: var(--padding);
		}
	}
</style>
