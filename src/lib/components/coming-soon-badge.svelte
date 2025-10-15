<script lang="ts">
	import { _ } from 'svelte-i18n'
</script>

<span class="beta-badge">{$_('common.comingSoon')}</span>

<style>
	:root {
		--color: var(--colors-high);
	}
	.beta-badge {
		border: 1px solid var(--color);
		color: var(--color);
		border-radius: 1rem;
		padding: 0.25rem 0.5rem;
		font: var(--font-family-sans-serif);
		font-weight: 800;
		font-size: 10px;
		line-height: 12px;
		letter-spacing: 1px;
		user-select: none;
		text-transform: uppercase;
		max-width: 100px;
		white-space: nowrap;
	}
</style>
