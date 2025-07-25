<script lang="ts">
	type Props = {
		autoplay?: boolean
	}

	let { autoplay = false }: Props = $props()

	const VIDEO_ID = '1kXcIpbDjBc'
</script>

<div class="video">
	<iframe
		src={`https://www.youtube.com/embed/${VIDEO_ID}${autoplay ? '?autoplay=1' : ''}`}
		class="video"
		title="intro video"
	>
	</iframe>
</div>

<style>
	iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}
	.video {
		background-color: black;
		width: 100%;
		max-width: 100%;
		aspect-ratio: 16 / 9;
		border: 0;
	}
</style>
