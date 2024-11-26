<script lang="ts">
	import { page } from '$app/stores'
	import adapters from '$lib/adapters'
	import Avatar from '$lib/components/avatar.svelte'
	import InvestmentCard from '$lib/components/investment-card.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import type { PortfolioView } from '$lib/types'
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'

	const session_id = $page.params.id
	let portfolioView: PortfolioView | undefined = $state()
	let notFound = $state(false)

	onMount(async () => {
		portfolioView = await adapters.portfolioView(session_id)
		if (!portfolioView) {
			notFound = true
		}
	})
</script>

<main>
	{#if notFound}
		<div class="center">404 - {$_('Page not found')}</div>
	{:else if !portfolioView}
		<div class="center">
			<Loader />
		</div>
	{:else}
		<section class="topbar horizontal">
			<Avatar
				name={portfolioView.client.name}
				birthDate={new Date(portfolioView.client.birth_date)}
			/>
			<Typography variant="h4" bold>{portfolioView.portfolio.name}</Typography>
			<Typography variant="large">| {portfolioView.client.name}</Typography>
			<div class="grower"></div>
		</section>
		<section class="horizontal grower">
			<section class="sidebar vertical">
				<section class="investments">
					{#each portfolioView.investments as investment}
						<InvestmentCard viewOnly={true} {investment} portfolio={portfolioView.portfolio} />
					{/each}
				</section>
			</section>
			<section class="graph"></section>
		</section>
	{/if}
</main>

<style>
	:root {
		--max-width: 1370px;
	}
	main {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
	}
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
	.topbar {
		padding: var(--padding);
		border-top: 1px solid var(--colors-low);
		border-bottom: 1px solid var(--colors-low);
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--half-padding);
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--padding);
	}
	:global(.grower) {
		flex: 1;
	}
	.sidebar {
		width: 320px;
		border-right: 1px solid var(--colors-low);
		height: 100%;
		padding: var(--padding);
	}
	.investments {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
</style>
