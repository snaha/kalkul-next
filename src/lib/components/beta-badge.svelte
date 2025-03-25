<script>
	const { children } = $props()
</script>

<div class="beta-badge">
	{@render children()}
</div>

<style>
	:root {
		--color: var(--colors-dark-red);
	}
	.beta-badge {
		border: 1px solid var(--color);
		color: var(--color);
		border-radius: 0.75rem;
		padding: 0.25rem 0.5rem;
		font: var(--font-family-sans-serif);
		font-weight: 800;
		font-size: 10px;
		line-height: 12px;
		letter-spacing: 1px;
		user-select: none;
	}
</style>
