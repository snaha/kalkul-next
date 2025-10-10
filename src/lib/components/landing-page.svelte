<script lang="ts">
	import { ArrowRight, Checkmark } from 'carbon-icons-svelte'
	import Logo from './icons/logo.svelte'
	import Button from './ui/button.svelte'
	import { _, locale } from 'svelte-i18n'
	import { LOCALE_STORAGE_KEY } from '$lib/locales'
	import routes from '$lib/routes'
	import Typography from './ui/typography.svelte'
	import Vertical from './ui/vertical.svelte'
	import Footer from './footer.svelte'
	import ResponsiveLayout from './ui/responsive-layout.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import { browser } from '$app/environment'
	import BetaBadge from './beta-badge.svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Divider from './ui/divider.svelte'
	import Badge from './ui/badge.svelte'

	type Props = {
		isMobile: boolean
	}

	const { isMobile }: Props = $props()

	function setLocale(language: 'en' | 'cs') {
		if (browser) {
			localStorage.setItem(LOCALE_STORAGE_KEY, language)
		}
		$locale = language
	}
</script>

<header class:mobile={isMobile}>
	<div class="left">
		<Logo size={48} />
		<BetaBadge />
	</div>
	<div class="right">
		<Button
			variant="ghost"
			dimension="compact"
			onclick={() => setLocale($locale?.startsWith('en') ? 'cs' : 'en')}
		>
			{#if $locale?.startsWith('en')}
				CZ
			{:else}
				EN
			{/if}
		</Button>
		<Button variant="secondary" dimension="compact" href={routes.LOGIN}>{$_('common.login')}</Button
		>
		<Button variant="strong" dimension="compact" href={routes.SIGNUP}>{$_('common.signup')}</Button>
	</div>
</header>
<main class:mobile={isMobile}>
	<Vertical
		--vertical-gap="var(--double-padding)"
		--vertical-justify-content="center"
		--vertical-align-items="center"
	>
		<Typography variant={isMobile ? 'h2' : 'h1'} center>{$_('page.landing.title')}</Typography>
		<Typography variant="large" center>{$_('page.landing.subtitle')}</Typography>

		<Vertical
			class={isMobile ? 'max-width560' : 'max-width320'}
			--vertical-gap="var(--padding)"
			--vertical-align-items="stretch"
		>
			<Button variant="strong" dimension="large" href={routes.SIGNUP}
				>{$_('page.landing.getStarted')}<ArrowRight size={24} /></Button
			>
			<ResponsiveLayout
				--responsive-align-items="stretch"
				--responsive-justify-content={layoutStore.mobile ? 'stretch' : 'center'}
				class="max-width560"
			>
				<Button
					variant="ghost"
					dimension="compact"
					href={routes.SAMPLE_PORTFOLIO_LINK}
					target="_blank">{$_('common.viewSamplePortfolio')}</Button
				>
				<Button
					variant="ghost"
					dimension="compact"
					href={`mailto:support@kalkul.app?subject=${$_('email.templates.newsletter2025September.kalkulDemoRequest')}&body=${$_('email.templates.newsletter2025September.kalkulDemoRequestBody')}`}
					target="_blank">{$_('page.landing.requestDemo')}</Button
				>
			</ResponsiveLayout>
		</Vertical>
	</Vertical>

	<!-- svelte-ignore a11y_missing_attribute -->
	<img class="screenshot" style="width: 1302px" src="images/landing/hero-image.png" />

	<Divider --margin="0" />

	<Vertical --vertical-gap="var(--double-padding)">
		<Horizontal --horizontal-justify-content="center">
			<Typography variant="large" italic center accent>{$_('page.landing.stopJuggling')}</Typography
			>
		</Horizontal>
		<ResponsiveLayout
			--responsive-justify-content="stretch"
			--responsive-align-items="stretch"
			--responsive-gap="var(--double-padding)"
		>
			<Vertical
				class="flex bg-base box"
				--vertical-gap="var(--padding)"
				--vertical-justify-content="stretch"
				--vertical-align-items="center"
			>
				<!-- svelte-ignore a11y_missing_attribute -->
				<img
					src="images/landing/collaboration-2--streamline-bangalore.svg"
					width="200"
					height="200"
				/>
				<Typography variant="h4" center>{$_('page.landing.unifiedPortfoliosTitle')}</Typography>
				<Typography center>{$_('page.landing.unifiedPortfoliosDescription')}</Typography>
			</Vertical>

			<Vertical
				class="flex bg-base box"
				--vertical-gap="var(--padding)"
				--vertical-justify-content="stretch"
				--vertical-align-items="center"
			>
				<!-- svelte-ignore a11y_missing_attribute -->
				<img src="images/landing/business-strategy-introduction.svg" width="200" height="200" />
				<Typography variant="h4" center>{$_('page.landing.flexiblePlanningTitle')}</Typography>
				<Typography center>{$_('page.landing.flexiblePlanningDescription')}</Typography>
			</Vertical>

			<Vertical
				class="flex bg-base box"
				--vertical-gap="var(--padding)"
				--vertical-justify-content="stretch"
				--vertical-align-items="center"
			>
				<!-- svelte-ignore a11y_missing_attribute -->
				<img src="images/landing/business-presentation.svg" width="200" height="200" />
				<Typography variant="h4" center
					>{$_('page.landing.insightfulPresentationsTitle')}</Typography
				>
				<Typography center>{$_('page.landing.insightfulPresentationsDescription')}</Typography>
			</Vertical>
		</ResponsiveLayout>
	</Vertical>

	<Divider --margin="0" />

	<Vertical --vertical-gap="var(--quadruple-padding)">
		<Horizontal --horizontal-justify-content="center">
			<Typography variant="large" italic center accent
				>{$_('page.landing.builtWithAdvisors')}</Typography
			>
		</Horizontal>

		<ResponsiveLayout --responsive-gap="var(--double-padding)">
			<Vertical
				--vertical-gap="var(--padding)"
				--vertical-justify-content="center"
				class="max-width560"
			>
				<Vertical --vertical-gap="0">
					<Typography accent>{$_('page.landing.bigPicturePlanningLabel')}</Typography>
					<Typography variant="h4">{$_('page.landing.bigPicturePlanningTitle')}</Typography>
				</Vertical>
				<Typography>{$_('page.landing.bigPicturePlanningDescription')}</Typography>
				<Vertical --vertical-gap="0">
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.calculateGoalsQuickly')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.adjustAssumptions')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.strategyFirst')}</Typography>
					</Horizontal>
				</Vertical>
			</Vertical>

			<!-- svelte-ignore a11y_missing_attribute -->
			<img class="screenshot" style="width: 710px" src="images/landing/hero-image.png" />
		</ResponsiveLayout>
		<ResponsiveLayout --responsive-gap="var(--double-padding)" reverse>
			<Vertical
				--vertical-gap="var(--padding)"
				--vertical-justify-content="center"
				class="max-width560"
			>
				<Vertical --vertical-gap="0">
					<Typography accent>{$_('page.landing.granularInvestmentLabel')}</Typography>
					<Typography variant="h4">{$_('page.landing.granularInvestmentTitle')}</Typography>
				</Vertical>
				<Typography>{$_('page.landing.granularInvestmentDescription')}</Typography>
				<Vertical --vertical-gap="0">
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.importDataByIsin')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.setPreciseReturns')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.supportGoals')}</Typography>
					</Horizontal>
				</Vertical>
			</Vertical>

			<!-- svelte-ignore a11y_missing_attribute -->-->
			<img class="screenshot" style="width: 710px" src="images/landing/hero-image.png" />
		</ResponsiveLayout>

		<ResponsiveLayout --responsive-gap="var(--double-padding)">
			<Vertical
				--vertical-gap="var(--padding)"
				--vertical-justify-content="center"
				class="max-width560"
			>
				<Vertical --vertical-gap="0">
					<Typography accent>{$_('page.landing.dynamicRebalancingLabel')}</Typography>
					<Typography variant="h4">{$_('page.landing.dynamicRebalancingTitle')}</Typography>
				</Vertical>
				<Typography>{$_('page.landing.dynamicRebalancingDescription')}</Typography>
				<Vertical --vertical-gap="0">
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.modifyGoalsFreely')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.weightEachInvestment')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.automaticRecalculation')}</Typography>
					</Horizontal>
				</Vertical>
			</Vertical>

			<!-- svelte-ignore a11y_missing_attribute -->
			<img class="screenshot" style="width: 710px" src="images/landing/goals-change.png" />
		</ResponsiveLayout>

		<ResponsiveLayout --responsive-gap="var(--double-padding)" reverse>
			<Vertical
				--vertical-gap="var(--padding)"
				--vertical-justify-content="center"
				class="max-width560"
			>
				<Vertical --vertical-gap="0">
					<Typography accent>{$_('page.landing.powerfulVisualizationsLabel')}</Typography>
					<Typography variant="h4">{$_('page.landing.powerfulVisualizationsTitle')}</Typography>
				</Vertical>
				<Typography>{$_('page.landing.powerfulVisualizationsDescription')}</Typography>
				<Vertical --vertical-gap="0">
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.interactiveCharts')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.fullscreenMode')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.presentAnywhere')}</Typography>
					</Horizontal>
				</Vertical>
			</Vertical>

			<!-- svelte-ignore a11y_missing_attribute -->
			<img class="screenshot" style="width: 710px" src="images/landing/goals-change.png" />
		</ResponsiveLayout>

		<ResponsiveLayout --responsive-gap="var(--double-padding)">
			<Vertical
				--vertical-gap="var(--padding)"
				--vertical-justify-content="center"
				class="max-width560"
			>
				<Vertical --vertical-gap="0">
					<Typography accent>{$_('page.landing.flexibleSharingLabel')}</Typography>
					<Typography variant="h4">{$_('page.landing.flexibleSharingTitle')}</Typography>
				</Vertical>
				<Typography>{$_('page.landing.flexibleSharingDescription')}</Typography>
				<Vertical --vertical-gap="0">
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.meetEveryPreference')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.maintainControl')}</Typography>
					</Horizontal>
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Checkmark size={20} color="var(--colors-high)" />
						<Typography>{$_('page.landing.automaticUpdates')}</Typography>
					</Horizontal>
				</Vertical>
			</Vertical>

			<!-- svelte-ignore a11y_missing_attribute -->
			<img class="screenshot" style="width: 710px" src="images/landing/flexible-sharing.png" />
		</ResponsiveLayout>
	</Vertical>

	<Divider --margin="0" />

	<Vertical --vertical-gap="var(--double-padding)">
		<Horizontal --horizontal-justify-content="center">
			<Typography variant="large" italic center accent
				>{$_('page.landing.whyAdvisorsTrust')}</Typography
			>
		</Horizontal>
		<ResponsiveLayout
			--responsive-justify-content="stretch"
			--responsive-align-items="stretch"
			--responsive-gap="var(--double-padding)"
		>
			<Vertical
				class="flex"
				--vertical-gap="var(--padding)"
				--vertical-justify-content="start"
				--vertical-align-items="start"
			>
				<Vertical --vertical-gap="var(--quarter-padding)">
					<Typography accent>{$_('page.landing.advisorDrivenLabel')}</Typography>
					<Typography variant="h4">{$_('page.landing.advisorDrivenTitle')}</Typography>
				</Vertical>

				<Typography>{$_('page.landing.advisorDrivenDescription')}</Typography>
			</Vertical>

			<Vertical
				class="flex"
				--vertical-gap="var(--padding)"
				--vertical-justify-content="start"
				--vertical-align-items="start"
			>
				<Vertical --vertical-gap="var(--quarter-padding)">
					<Typography accent>{$_('page.landing.noHiddenAgendaLabel')}</Typography>
					<Typography variant="h4">{$_('page.landing.noHiddenAgendaTitle')}</Typography>
				</Vertical>
				<Typography>{$_('page.landing.noHiddenAgendaDescription')}</Typography>
			</Vertical>

			<Vertical
				class="flex"
				--vertical-gap="var(--padding)"
				--vertical-justify-content="start"
				--vertical-align-items="start"
			>
				<Vertical --vertical-gap="var(--quarter-padding)">
					<Typography accent>{$_('page.landing.localExpertiseLabel')}</Typography>
					<Typography variant="h4">{$_('page.landing.localExpertiseTitle')}</Typography>
				</Vertical>
				<Typography>{$_('page.landing.localExpertiseDescription')}</Typography>
			</Vertical>
		</ResponsiveLayout>
	</Vertical>

	<Divider --margin="0" />

	<Vertical
		--vertical-gap="var(--double-padding)"
		--vertical-justify-content="center"
		--vertical-align-items="center"
	>
		<Vertical --vertical-gap="0" --vertical-align-items="center">
			<Typography variant="h3">{$_('page.landing.joinFreeBeta')}</Typography>

			<Typography variant="large">{$_('page.landing.joinFreeBetaSubtitle')}</Typography>
		</Vertical>

		<Vertical
			class={isMobile ? 'max-width560' : 'max-width320'}
			--vertical-gap="var(--padding)"
			--vertical-align-items="stretch"
		>
			<Button variant="strong" dimension="large" href={routes.SIGNUP}
				>{$_('page.landing.getStarted')}<ArrowRight size={24} /></Button
			>
			<ResponsiveLayout
				--responsive-align-items="stretch"
				--responsive-justify-content={layoutStore.mobile ? 'stretch' : 'center'}
				class="max-width560"
			>
				<Button
					variant="ghost"
					dimension="compact"
					href={routes.SAMPLE_PORTFOLIO_LINK}
					target="_blank">{$_('common.viewSamplePortfolio')}</Button
				>
				<Button
					variant="ghost"
					dimension="compact"
					href={`mailto:support@kalkul.app?subject=${$_('email.templates.newsletter2025September.kalkulDemoRequest')}&body=${$_('email.templates.newsletter2025September.kalkulDemoRequestBody')}`}
					target="_blank">{$_('page.landing.requestDemo')}</Button
				>
			</ResponsiveLayout>
		</Vertical>
	</Vertical>
	<Horizontal --horizontal-justify-content="center" --horizontal-align-items="center">
		<Badge>{$_('email.common.madeWithLove')}</Badge>
	</Horizontal>
</main>
<Footer />

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--double-padding);
	}
	.left {
		display: flex;
		align-items: center;
	}
	.right {
		display: flex;
		gap: var(--half-padding);
	}
	main {
		display: flex;
		width: 100%;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--double-padding);
		gap: var(--quadruple-padding);
	}
	:global(.max-width720) {
		max-width: 720px;
		width: 100%;
	}
	:global(.max-width320) {
		max-width: 320px;
		width: 100%;
	}
	:global(.max-width560) {
		max-width: 560px;
		width: 100%;
	}
	:global(.flex) {
		flex: 1;
	}
	:global(.bg-base) {
		background-color: var(--colors-base);
	}
	:global(.box) {
		padding: var(--padding);
		border: 1px solid var(--colors-low);
	}
	.mobile {
		padding: var(--padding);
		gap: var(--double-padding);
	}
	img.screenshot {
		background-color: transparent;
		max-width: 100%;
		width: auto;
		height: auto;
		aspect-ratio: 1.7786;
	}
</style>
