<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import { base } from '$app/paths'

	type Props = {
		title: string
		description: string
		imageName: string
		onclick: () => void
	}

	let { title, description, imageName, onclick }: Props = $props()
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="template-card" {onclick}>
	<Vertical --vertical-gap="var(--padding)" --vertical-align-items="center">
		<div class="image-container">
			<img src={`${base}/images/templates/${imageName}.svg`} alt={title} />
		</div>
		<Vertical --vertical-gap="var(--half-padding)" --vertical-align-items="center">
			<Typography variant="h5">{title}</Typography>
			<Typography class="description">{description}</Typography>
		</Vertical>
	</Vertical>
</div>

<style>
	.template-card {
		border: 1px solid var(--colors-low);
		border-radius: 8px;
		padding: var(--padding);
		cursor: pointer;
		transition: all 0.2s ease;
		background-color: var(--colors-base);
		width: 250px;
		display: flex;
		flex-direction: column;
	}

	.template-card:hover {
		border-color: var(--colors-medium);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.image-container {
		width: 100%;
		height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--half-padding);
	}

	.image-container img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	:global(.template-card .description) {
		text-align: center;
		/* color: var(--colors-ultra-high);
		font-size: var(--font-size); */
	}
</style>
