<script>
	import { SERIES_COLORS } from '$lib/colors'

	let { colorIndex } = $props()
</script>

<div class="color-box" style={`background-color: ${SERIES_COLORS[colorIndex]}`}></div>

<style>
	.color-box {
		min-width: 36px;
		min-height: 24px;
		border-radius: var(--border-radius);
	}
</style>
