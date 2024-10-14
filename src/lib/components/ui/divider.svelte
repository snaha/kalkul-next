<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'

	type Orientation = 'vertical' | 'horizontal'
	interface Props extends HTMLAttributes<HTMLHRElement> {
		orientation?: Orientation
	}
	let { orientation = 'horizontal', class: className = '', ...restProps }: Props = $props()
</script>

<hr class="{orientation} {className}" {...restProps} />

<style>
	.horizontal {
		margin-top: var(--padding);
		margin-bottom: var(--padding);
		width: 100%;
	}
	.vertical {
		margin-right: var(--padding);
		margin-left: var(--padding);
		min-width: 1px;
		height: 100%;
		min-height: var(--padding);
	}
	hr {
		appearance: none;
		border-width: 1px 1px 0 0;
		border-style: solid;
		color: var(--colors-low);
	}
</style>
