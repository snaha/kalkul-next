<script lang="ts">
	import ContentLayout from '$lib/components/content-layout.svelte'
	import FaqBox from '$lib/components/faq-box.svelte'
	import Footer from '$lib/components/footer.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import GetStartedBox from '$lib/components/get-started-box.svelte'
	import Discord from '$lib/components/icons/discord.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Divider from '$lib/components/ui/divider.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import ResponsiveLayout from '$lib/components/ui/responsive-layout.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import routes, { getStartedSections } from '$lib/routes'
	import { _ } from 'svelte-i18n'
	import { Launch } from 'carbon-icons-svelte'
	import { page } from '$app/state'

	const hash = $derived(page.url.hash)

	function isExpanded(s: string) {
		if (hash === '') {
			return true
		}
		return `#${s}` === hash
	}
</script>

<Fullscreen
	hasCloseButton={false}
	--header-background-color="var(--colors-ultra-low)"
	--header-position="absolute"
>
	<ContentLayout>
		<Vertical --vertical-gap="var(--double-padding)" --vertical-align-items="center">
			<Vertical --vertical-gap="var(--padding)" --vertical-align-items="center" class="max-560">
				<img
					src="/images/get-started/business-startup-new-product-launch.svg"
					width="250"
					height="250"
					alt={$_('page.getStarted.altTexts.illustration')}
				/>

				<Typography variant="h3" class="text-center">{$_('page.getStarted.title')}</Typography>
				<Typography variant="large" class="text-center">{$_('page.getStarted.subtitle')}</Typography
				>
				<ResponsiveLayout --responsive-justify-content="center" class="max-560">
					<Button variant="strong" href={routes.HOME} target="_blank" class="stretch"
						><Launch size={24} />{$_('page.getStarted.openApp')}</Button
					>
					<Button variant="secondary" href={routes.DISCORD} target="_blank" class="stretch"
						><Discord size={24} />{$_('page.getStarted.joinDiscord')}</Button
					>
				</ResponsiveLayout>

				<Typography italic={true} class="text-center"
					>{$_('page.getStarted.keepPageOpen')}</Typography
				>
			</Vertical>
			<Vertical --vertical-gap="var(--padding)" --vertical-align-items="center" class="max-560">
				<FaqBox title={$_('page.getStarted.whatIsKalkul.title')}>
					<Typography>{$_('page.getStarted.whatIsKalkul.content')}</Typography>
				</FaqBox>
				<FaqBox title={$_('page.getStarted.isFree.title')}>
					<Typography>{$_('page.getStarted.isFree.content')}</Typography>
					<Typography italic>{$_('page.getStarted.isFree.laterNote')}</Typography>
				</FaqBox>
				<FaqBox title={$_('page.getStarted.whyDiscord.title')}>
					<Typography>{$_('page.getStarted.whyDiscord.content')}</Typography>
					<Typography italic>{$_('page.getStarted.whyDiscord.newToDiscord')}</Typography>
					<Horizontal --horizontal-justify-content="center"
						><Button
							variant="strong"
							href={routes.DISCORD}
							target="_blank"
							onclick={(e) => e.stopImmediatePropagation()}
							><Discord size={24} />{$_('page.getStarted.whyDiscord.joinButton')}</Button
						></Horizontal
					>
				</FaqBox>
			</Vertical>

			<GetStartedBox
				title={$_('page.getStarted.createClient.title')}
				expanded={isExpanded(getStartedSections.CREATE_CLIENT)}
				id={getStartedSections.CREATE_CLIENT}
			>
				{#snippet text()}
					<Typography>
						{$_('page.getStarted.createClient.intro')}
						<ul>
							<li>{$_('page.getStarted.createClient.requirements.name')}</li>
							<li>{$_('page.getStarted.createClient.requirements.birthdate')}</li>
							<li>{$_('page.getStarted.createClient.requirements.email')}</li>
							<li>{$_('page.getStarted.createClient.requirements.picture')}</li>
						</ul>
					</Typography>
				{/snippet}
				<img
					class="screenshot"
					src="/images/get-started/create-client.png"
					alt={$_('page.getStarted.altTexts.createClient')}
					style="width: 653px;"
				/>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography>{$_('page.getStarted.createClient.afterCreation')}</Typography>
				</Vertical>
				<img
					class="screenshot"
					src="/images/get-started/client-list.png"
					alt={$_('page.getStarted.altTexts.clientList')}
					style="width: 1058px;"
				/>
				<Divider class="max-560" --margin="0" />
			</GetStartedBox>

			<GetStartedBox
				title={$_('page.getStarted.createPortfolio.title')}
				expanded={isExpanded(getStartedSections.CREATE_PORTFOLIO)}
				id={getStartedSections.CREATE_PORTFOLIO}
			>
				{#snippet text()}
					<Typography>{$_('page.getStarted.createPortfolio.intro')}</Typography>
					<Typography italic>{$_('page.getStarted.createPortfolio.tip')}</Typography>
					<Typography>
						{$_('page.getStarted.createPortfolio.requirements')}
						<ul>
							<li>{$_('page.getStarted.createPortfolio.steps.name')}</li>
							<li>{$_('page.getStarted.createPortfolio.steps.currency')}</li>
							<li>{$_('page.getStarted.createPortfolio.steps.horizon')}</li>
						</ul>
					</Typography>
				{/snippet}
				<img
					class="screenshot"
					src="/images/get-started/create-portfolio.png"
					alt={$_('page.getStarted.altTexts.createPortfolio')}
					style="width: 638px;"
				/>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography>{$_('page.getStarted.createPortfolio.multiplePortfolios')}</Typography>
				</Vertical>
				<img
					class="screenshot"
					src="/images/get-started/portfolio-list.png"
					alt={$_('page.getStarted.altTexts.portfolioList')}
					style="width: 1022px;"
				/>
				<Divider class="max-560" --margin="0" />
			</GetStartedBox>

			<GetStartedBox
				title={$_('page.getStarted.addInvestment.title')}
				expanded={isExpanded(getStartedSections.ADD_INVESTMENT)}
				id={getStartedSections.ADD_INVESTMENT}
			>
				{#snippet text()}
					<Typography>{$_('page.getStarted.addInvestment.intro')}</Typography>
					<Typography>
						{$_('page.getStarted.addInvestment.requirements')}
						<ul>
							<li>{$_('page.getStarted.addInvestment.steps.name')}</li>
							<li>{$_('page.getStarted.addInvestment.steps.type')}</li>
							<li>{$_('page.getStarted.addInvestment.steps.apy')}</li>
							<li>{$_('page.getStarted.addInvestment.steps.fees')}</li>
						</ul>
					</Typography>
					<Typography italic>{$_('page.getStarted.addInvestment.importTip')}</Typography>
				{/snippet}
				<img
					class="screenshot"
					src="/images/get-started/create-investment.png"
					alt={$_('page.getStarted.altTexts.createInvestment')}
					style="width: 641px;"
				/>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography>{$_('page.getStarted.addInvestment.afterCreation')}</Typography>
				</Vertical>
				<img
					class="screenshot"
					src="/images/get-started/portfolio.png"
					alt={$_('page.getStarted.altTexts.portfolio')}
					style="width: 1022px;"
				/>
				<Divider class="max-560" --margin="0" />
			</GetStartedBox>

			<GetStartedBox
				title={$_('page.getStarted.addTransactions.title')}
				expanded={isExpanded(getStartedSections.ADD_TRANSACTION)}
				id={getStartedSections.ADD_TRANSACTION}
			>
				{#snippet text()}
					<Typography>{$_('page.getStarted.addTransactions.intro')}</Typography>
					<Typography>
						{$_('page.getStarted.addTransactions.requirements')}
						<ul>
							<li>{$_('page.getStarted.addTransactions.steps.type')}</li>
							<li>{$_('page.getStarted.addTransactions.steps.frequency')}</li>
							<li>{$_('page.getStarted.addTransactions.steps.amount')}</li>
							<li>{$_('page.getStarted.addTransactions.steps.label')}</li>
							<li>{$_('page.getStarted.addTransactions.steps.date')}</li>
						</ul>
					</Typography>
				{/snippet}
				<img
					class="screenshot"
					src="/images/get-started/create-transaction.png"
					alt={$_('page.getStarted.altTexts.createTransaction')}
					style="width: 390px;"
				/>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography>{$_('page.getStarted.addTransactions.afterCreation')}</Typography>
				</Vertical>
				<img
					class="screenshot"
					src="/images/get-started/transaction-card.png"
					alt={$_('page.getStarted.altTexts.transactionCard')}
					style="width: 1022px;"
				/>
				<Divider class="max-560" --margin="0" />
			</GetStartedBox>

			<GetStartedBox
				title={$_('page.getStarted.reviewPresent.title')}
				expanded={isExpanded(getStartedSections.REVIEW_AND_PRESENT)}
				id={getStartedSections.REVIEW_AND_PRESENT}
			>
				{#snippet text()}
					<Typography>{$_('page.getStarted.reviewPresent.intro')}</Typography>
					<Typography variant="h5"
						>{$_('page.getStarted.reviewPresent.focusSection.title')}</Typography
					>
					<Typography>{$_('page.getStarted.reviewPresent.focusSection.focusChart')}</Typography>
					<Typography>{$_('page.getStarted.reviewPresent.focusSection.hideInvestments')}</Typography
					>
				{/snippet}
				<img
					class="screenshot"
					src="/images/get-started/investment-menu.png"
					alt={$_('page.getStarted.altTexts.investmentMenu')}
					style="width: 389px;"
				/>
				<img
					class="screenshot"
					src="/images/get-started/hidden-investments.png"
					alt={$_('page.getStarted.altTexts.hiddenInvestments')}
					style="width: 1022px;"
				/>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography
						>{$_('page.getStarted.reviewPresent.focusSection.hideTransactions')}</Typography
					>
				</Vertical>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography variant="h5"
						>{$_('page.getStarted.reviewPresent.inflationSection.title')}</Typography
					>
					<Typography>{$_('page.getStarted.reviewPresent.inflationSection.description')}</Typography
					>
					<Typography italic>{$_('page.getStarted.reviewPresent.inflationSection.note')}</Typography
					>
				</Vertical>
				<img
					class="screenshot"
					src="/images/get-started/portfolio-inflation.png"
					alt={$_('page.getStarted.altTexts.portfolioInflation')}
					style="width: 1022px;"
				/>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography variant="h5"
						>{$_('page.getStarted.reviewPresent.fullscreenSection.title')}</Typography
					>
					<Typography
						>{$_('page.getStarted.reviewPresent.fullscreenSection.description')}</Typography
					>
					<Typography italic>{$_('page.getStarted.reviewPresent.fullscreenSection.tip')}</Typography
					>
				</Vertical>
				<img
					class="screenshot"
					src="/images/get-started/portfolio-fullscreen.png"
					alt={$_('page.getStarted.altTexts.portfolioFullscreen')}
					style="width: 1022px;"
				/>
				<Divider class="max-560" --margin="0" />
			</GetStartedBox>

			<GetStartedBox
				title={$_('page.getStarted.sharePortfolio.title')}
				expanded={isExpanded(getStartedSections.SHARE_PORTFOLIO)}
				id={getStartedSections.SHARE_PORTFOLIO}
			>
				{#snippet text()}
					<Typography>{$_('page.getStarted.sharePortfolio.intro')}</Typography>
				{/snippet}
				<img
					class="screenshot"
					src="/images/get-started/share-options.png"
					alt={$_('page.getStarted.altTexts.shareOptions')}
					style="width: 1027px;"
				/>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography variant="h5"
						>{$_('page.getStarted.sharePortfolio.linkSharing.title')}</Typography
					>
					<Typography>{$_('page.getStarted.sharePortfolio.linkSharing.description')}</Typography>
					<Typography italic>{$_('page.getStarted.sharePortfolio.linkSharing.note')}</Typography>
				</Vertical>
				<img
					class="screenshot"
					src="/images/get-started/share-with-link.png"
					alt={$_('page.getStarted.altTexts.shareWithLink')}
					style="width: 650px;"
				/>
				<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="stretch">
					<Typography variant="h5"
						>{$_('page.getStarted.sharePortfolio.pdfExport.title')}</Typography
					>
					<Typography>{$_('page.getStarted.sharePortfolio.pdfExport.description')}</Typography>
					<Typography italic>{$_('page.getStarted.sharePortfolio.pdfExport.note')}</Typography>
				</Vertical>
				<img
					class="screenshot"
					src="/images/get-started/pdf-export.png"
					alt={$_('page.getStarted.altTexts.pdfExport')}
					style="width: 657px;"
				/>
				<Divider class="max-560" --margin="0" />
			</GetStartedBox>
			<Vertical class="max-560" --vertical-gap="var(--padding)" --vertical-align-items="center">
				<Typography class="text-center">{$_('page.getStarted.conclusion.thanks')}</Typography>

				<Typography variant="h5">{$_('page.getStarted.conclusion.feedback.title')}</Typography>
				<Typography class="text-center"
					>{$_('page.getStarted.conclusion.feedback.description')}</Typography
				>
				<Horizontal --horizontal-justify-content="center"
					><Button variant="strong" href={routes.DISCORD}
						><Discord size={24} />{$_('page.getStarted.conclusion.feedback.button')}</Button
					></Horizontal
				>
			</Vertical>
		</Vertical>
	</ContentLayout>
</Fullscreen>
<Footer />

<style>
	:global(.max-560) {
		max-width: 560px;
		width: 100%;
	}
	:global(.text-center) {
		text-align: center;
	}
	@media screen and (max-width: 1023px) {
		:global(.stretch) {
			flex-grow: 1 !important;
			width: 100%;
		}
	}
	img.screenshot {
		max-width: calc(100% - var(--double-padding));
		width: auto;
		height: auto;
		box-shadow: 0px 4px 24px 0px #00000040;
	}
	ul {
		padding-left: var(--padding);
	}
</style>
