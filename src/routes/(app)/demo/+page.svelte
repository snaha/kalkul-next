<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { notImplemented } from '$lib/demo/utils'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import PortfolioTemplateCard from '$lib/demo/components/portfolio-template-card.svelte'
	import { locale } from 'svelte-i18n'

	function openRetirementCalculator() {
		goto(routes.RETIREMENT_CALCULATOR)
	}

	function startWithBlank() {
		// Navigate to demo portfolio page
		goto(routes.DEMO())
	}
</script>

<ContentLayout centered={false}>
	<section class="empty">
		<div class="empty-header">
			<Typography variant="h5">{$_('page.client.addFirstInvestmentGoal')}</Typography>
			<Typography>{$_('page.client.chooseCalculatorBelow')}</Typography>
		</div>
		<div class="spacer"></div>
		<div class="templates-grid">
			<PortfolioTemplateCard
				title={$_('page.client.templates.retirement.title')}
				description={$_('page.client.templates.retirement.description')}
				imageName="retirement"
				onclick={openRetirementCalculator}
			/>
			<PortfolioTemplateCard
				title={$_('page.client.templates.houseBuying.title')}
				description={$_('page.client.templates.houseBuying.description')}
				imageName="house"
				onclick={() => notImplemented($locale)}
			/>
			<PortfolioTemplateCard
				title={$_('page.client.templates.kidsEducation.title')}
				description={$_('page.client.templates.kidsEducation.description')}
				imageName="kids"
				onclick={() => notImplemented($locale)}
			/>
			<PortfolioTemplateCard
				title={$_('page.client.templates.largePurchase.title')}
				description={$_('page.client.templates.largePurchase.description')}
				imageName="large_purchase"
				onclick={() => notImplemented($locale)}
			/>
			<PortfolioTemplateCard
				title={$_('page.client.templates.optimisedWithdrawals.title')}
				description={$_('page.client.templates.optimisedWithdrawals.description')}
				imageName="withdrawals"
				onclick={() => notImplemented($locale)}
			/>
		</div>
		<Typography class="or-divider">or</Typography>
		<Button variant="solid" dimension="compact" onclick={startWithBlank}
			>{$_('page.client.startWithBlank')}</Button
		>
	</section>
</ContentLayout>

<style>
	.empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--half-padding);
		padding: var(--double-padding) 0;
		max-width: 1400px;
		margin: 0 auto;
	}
	.empty-header {
		width: 100%;
		text-align: left;
	}
	.templates-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--padding);
		width: 100%;
	}
	.spacer {
		margin-top: var(--padding);
	}
	:global(.or-divider) {
		color: var(--colors-medium);
		font-size: var(--font-size-small);
	}
</style>
