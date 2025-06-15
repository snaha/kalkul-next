<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		expanded: boolean
		children: Snippet
		horizontal: boolean
		vertical: boolean
	}

	let { expanded = $bindable(), children, horizontal, vertical }: Props = $props()
</script>

<div
	class="expander {expanded ? 'expanded' : ''} {horizontal ? 'horizontal' : ''} {vertical
		? 'vertical'
		: ''}"
	id="expander"
>
	<div class="expander-content {horizontal ? 'horizontal' : ''} {vertical ? 'vertical' : ''}">
		{@render children()}
	</div>
</div>

<style>
	.expander {
		display: grid;
		overflow: hidden;
		transition:
			grid-template-rows 0.2s ease-in,
			grid-template-columns 0.2s ease-in;
	}
	.expander.horizontal {
		grid-template-columns: 0fr;
	}
	.expander.vertical {
		grid-template-rows: 0fr;
	}
	.expander-content {
		transition: opacity 0.2s ease-in;
		opacity: 0;
	}
	.expander-content.horizontal {
		min-width: 0;
	}
	.expander-content.vertical {
		min-height: 0;
	}
	.expander.expanded {
		grid-template-rows: 1fr;
		grid-template-columns: 1fr;
	}
	.expander.expanded .expander-content {
		opacity: 1;
	}
</style>
