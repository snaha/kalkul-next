<script lang="ts">
	import CustomHeader from '$lib/components/custom-header.svelte'

	let { children } = $props()
</script>

<CustomHeader />
{@render children()}
