<script>
	import { SERIES_COLORS } from '$lib/colors'

	let { colorIndex, width = '36px', height = '24px' } = $props()
</script>

<div
	class="color-box"
	style={`background-color: ${SERIES_COLORS[colorIndex]}; min-width: ${width}; min-height: ${height}`}
></div>

<style>
	.color-box {
		border-radius: var(--border-radius);
	}
</style>
