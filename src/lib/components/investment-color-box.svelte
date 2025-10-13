<script lang="ts">
	import { SERIES_COLORS } from '$lib/colors'
	import type { Snippet } from 'svelte'

	type Props = {
		colorIndex: number
		width?: string
		height?: string
		children?: Snippet
	}

	let { colorIndex, width = '36px', height = '24px', children }: Props = $props()
</script>

<div
	class="color-box"
	style={`background-color: ${SERIES_COLORS[colorIndex]}; min-width: ${width}; min-height: ${height}`}
>
	{@render children?.()}
</div>

<style>
	.color-box {
		border-radius: var(--border-radius);
	}
</style>
