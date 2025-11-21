<script lang="ts">
	import { page } from '$app/state'
	import EditDemoInvestment from '$lib/demo/components/edit-demo-investment.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { demoStore } from '$lib/demo/stores/demo.svelte'
	import { _ } from 'svelte-i18n'

	const investmentId = $derived(page.params.investment_id)
	const portfolio = $derived(demoStore.portfolio)
	const investment = $derived(demoStore.investments.find((i) => i.id === investmentId))

	function close() {
		history.back()
	}
</script>

<Fullscreen hasCustomHeader={false}>
	{#if portfolio && investment}
		<EditDemoInvestment {close} {portfolio} {investment} />
	{:else}
		<Typography variant="h2">404 - {$_('common.notFound')}</Typography>
	{/if}
</Fullscreen>
