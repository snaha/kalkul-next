<script lang="ts">
	import EditDemoInvestment from '$lib/demo/components/edit-demo-investment.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { demoStore } from '$lib/demo/stores/demo.svelte'
	import { _ } from 'svelte-i18n'

	const portfolio = $derived(demoStore.portfolio)

	function close() {
		history.back()
	}
</script>

<Fullscreen hasCustomHeader={false}>
	{#if portfolio}
		<EditDemoInvestment {close} {portfolio} />
	{:else}
		<Typography variant="h2">404 - {$_('common.notFound')}</Typography>
	{/if}
</Fullscreen>
