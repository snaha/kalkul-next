<script lang="ts">
	import { page } from '$app/state'
	import { portfolioStore } from '$lib/stores/portfolio.svelte'
	import { clientStore } from '$lib/stores/clients.svelte'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { transactionStore } from '$lib/stores/transaction.svelte'
	import { withInvestmentsViewStore } from '$lib/stores/investments-view.svelte'
	import { deriveGraphValueData } from '$lib/graph'
	import PdfExport from '$lib/components/pdf-export.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import { _ } from 'svelte-i18n'
	import { getGraphDataForPortfolio } from '$lib/@snaha/kalkul-maths'
	import { getCSSVariableValue } from '$lib/css-vars'

	const clientId = $derived(page.params.id)
	const client = $derived(clientStore.data.find((client) => client.id === clientId))
	const portfolioId = $derived(page.params.portfolio_id)
	const portfolio = $derived(portfolioStore.data.find((portfolio) => portfolio.id === portfolioId))

	// Read PDF export parameters from URL
	const searchParams = $derived(page.url.searchParams)
	const keyDates = $derived(
		searchParams
			.get('keyDates')
			?.split(',')
			.map((d) => new Date(d))
			.filter((d) => !isNaN(d.getTime())) || [],
	)
	const investments = $derived(investmentStore.filter(portfolioId))
	const investmentIds = $derived(investments.map((investment) => investment.id))
	const transactions = $derived(
		transactionStore.data.filter((transaction) =>
			investmentIds.includes(transaction.investment_id),
		),
	)

	const investmentsViewStore = $derived(
		withInvestmentsViewStore(investmentStore.filter(portfolioId)),
	)

	let isLoading = $derived(
		clientStore.loading ||
			portfolioStore.loading ||
			investmentStore.loading ||
			transactionStore.loading,
	)

	let adjustWithInflation = $state(false)
	const { total, data } = $derived(
		getGraphDataForPortfolio(transactionStore.data, investments, portfolio!),
	)

	const lowColor = getCSSVariableValue('--colors-low')
	const baseColor = `${getCSSVariableValue('--colors-base')}cc`

	const graphValueData = $derived(
		portfolio && investments && transactions
			? deriveGraphValueData({
					portfolio,
					investments,
					investmentsViewStore,
					total,
					data,
					lowColor,
					baseColor,
				})
			: undefined,
	)

	$effect(() => {
		investmentsViewStore.allInvestments = investments
	})
</script>

<svelte:head>
	<title>{portfolio?.name} - PDF Export</title>
	<style>
		@media print {
			@page {
				size: A4 landscape;
				margin: 0;
			}
			body {
				margin: 0;
				padding: 0;
			}
		}
	</style>
</svelte:head>

{#if isLoading || !graphValueData}
	<Fullscreen>
		<Loader />
	</Fullscreen>
{:else if !portfolio || !client}
	<Fullscreen>
		404 - {$_('common.notFound')}
	</Fullscreen>
{:else}
	<PdfExport
		{graphValueData}
		{adjustWithInflation}
		clientBirthDate={client.birth_date ? new Date(client.birth_date) : undefined}
		portfolioName={portfolio.name}
		clientName={client.name}
		{keyDates}
	/>
{/if}
