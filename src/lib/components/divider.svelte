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
		margin-top: var(--double-padding);
		margin-bottom: var(--double-padding);
		width: 100%;
	}
	.vertical {
		margin-right: var(--double-padding);
		margin-left: var(--double-padding);
		height: 100%;
	}
	hr {
		appearance: none;
		border-width: 1px;
		border-style: solid;
		color: var(--colors-low);
	}
</style>
