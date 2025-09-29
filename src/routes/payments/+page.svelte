<script lang="ts">
	import { base } from '$app/paths'
	import {
		PUBLIC_PRODUCT_EARLY_BIRD_PRICE_ID,
		PUBLIC_PRODUCT_PRICE_ID,
		PUBLIC_PRODUCT_TRIAL_DAYS,
	} from '$env/static/public'
	import { authorizedFetch } from '$lib/auth'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import Badge from '$lib/components/ui/badge.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import { loadSubscriptions } from '$lib/payments/load'
	import routes, { apiRoutes } from '$lib/routes'
	import { subscriptionStore } from '$lib/stores/subscription.svelte'
	import { ArrowRight, CheckmarkFilled, Rocket, WatsonHealthRotate_360 } from 'carbon-icons-svelte'
	import { addDays } from 'date-fns'
	import type Stripe from 'stripe'
	import type { StripeSubscription } from '$lib/types'
	import { onMount } from 'svelte'
	import { _, locale } from 'svelte-i18n'
	import { PROMOTION, PROMOTION_STORAGE_KEY } from '$lib/payments'

	let loading = $state(true)
	let payButtonDisabled = $state(false)
	let price: Stripe.Price | undefined = $state()
	let isPromotion = $state(false)
	let promotionalPrice: Stripe.Price | undefined = $state()
	let error: string | undefined = $state()
	const activeSubscription: StripeSubscription | undefined = $derived(
		subscriptionStore.getActiveSubscription(),
	)
	const hasExistingSubscription = $derived(subscriptionStore.data.length > 0)
	const isTrial = $derived(!hasExistingSubscription)
	const currency = $derived(price?.currency.toUpperCase())
	const yearlyFee = $derived((price?.unit_amount ?? 0) / 100)
	const monthlyFee = $derived(yearlyFee / 12)
	const trialDays = parseInt(PUBLIC_PRODUCT_TRIAL_DAYS, 10)
	const trialRemainingDays = $derived(isTrial ? trialDays : 0)

	const promotionalYearlyFee = $derived((promotionalPrice?.unit_amount ?? 0) / 100)
	const promotionalMonthlyFee = $derived(promotionalYearlyFee / 12)
	const firstPaymentFormattedDate = $derived(
		addDays(new Date(), trialDays).toLocaleDateString(undefined, {
			dateStyle: 'medium',
		}),
	)
	const formatNumber = new Intl.NumberFormat().format

	async function onClickPay() {
		payButtonDisabled = true

		const response = await authorizedFetch(apiRoutes.CHECKOUT, {
			method: 'POST',
			body: JSON.stringify({
				locale,
				currency,
			}),
		})

		const { url } = await response.json()
		if (!url) {
			throw new Error('invalid checkout url', { cause: url })
		}

		window.location = url
	}

	onMount(async () => {
		try {
			await fetchPrices()
		} catch (e) {
			error = String(e)
			console.error({ e })
		}
		error ||= subscriptionStore.error
		loading = false
	})

	async function fetchPrices() {
		price = await fetchPrice(PUBLIC_PRODUCT_PRICE_ID)
		if (
			!hasExistingSubscription &&
			localStorage.getItem(PROMOTION_STORAGE_KEY) === PROMOTION.MONEYFEST_SK_2025
		) {
			isPromotion = true
			promotionalPrice = await fetchPrice(PUBLIC_PRODUCT_EARLY_BIRD_PRICE_ID)
		} else {
			isPromotion = false
			promotionalPrice = price
		}
	}

	async function fetchPrice(price_id: string) {
		const response = await authorizedFetch(apiRoutes.PRICE(price_id))
		if (!response.ok) {
			throw new Error($_('common.errorWhileFetchingPrice'))
		}

		return (await response.json()) as Stripe.Price
	}

	async function reload() {
		error = undefined
		loading = true
		try {
			await loadSubscriptions()
			await fetchPrices()
		} catch (e) {
			console.error(e)
			error ||= String(e)
		}
		loading = false
	}
</script>

{#if loading}
	<ContentLayout>
		<Loader />
	</ContentLayout>
{:else if error}
	<ContentLayout>
		<Vertical --vertical-gap="var(--double-padding)" --vertical-align-items="center">
			<img
				src={`${base}/images/payment-error.svg`}
				alt={$_('common.error')}
				width="142"
				height="200"
			/>
			<Vertical --vertical-gap="var(--half-padding)">
				<Typography variant="large" bold
					>{$_('common.thereWasAnErrorWhileLoadingThePage')}</Typography
				>
				<Typography variant="large">{$_('common.pleaseTryReloadingThePage')}</Typography>
			</Vertical>
			<Button variant="strong" dimension="compact" onclick={reload}
				><WatsonHealthRotate_360 size={24} />{$_('common.reload')}</Button
			>
		</Vertical>
	</ContentLayout>
{:else}
	<Vertical --vertical-gap="var(--double-padding)" class="max560">
		{#if !activeSubscription}
			<Vertical --vertical-gap="var(--half-padding)">
				<Typography --colors-ultra-high={isTrial ? 'var(--colors-ultra-high)' : 'var(--colors-red)'}
					>{isTrial ? $_('common.welcomeToKalkul') : $_('common.noActiveSubscription')}</Typography
				>
				<Typography variant="h4"
					>{isTrial
						? $_('common.activateYourTrialRemainingDaysFreeTrialTemplate', {
								values: { trialRemainingDays },
							})
						: $_('common.pleaseSubscribeToUseKalkul')}</Typography
				>
			</Vertical>
			{#if isPromotion}
				<Vertical --vertical-gap="var(--padding)">
					<Vertical --vertical-gap="0">
						<Horizontal --horizontal-gap="var(--half-padding)">
							<Typography variant="large">
								<Typography variant="large" bold class="line-through"
									>{monthlyFee} {currency}</Typography
								>
								<Typography variant="large" bold class="green"
									>{promotionalMonthlyFee} {currency}</Typography
								>
								<Typography variant="large">/ {$_('common.month')}</Typography>
							</Typography>
							<Badge
								dimension="small"
								style="background-color: var(--colors-high); color: var(--colors-light-base)"
								><Rocket size={16} />{$_('common.earlyBirdDiscount')}</Badge
							>
						</Horizontal>
						<Typography variant="small">
							<Typography variant="small" class="line-through">{yearlyFee} {currency}</Typography
							>&nbsp;
							<Typography variant="small">
								{promotionalYearlyFee} {currency} {$_('common.billedEveryYear')}</Typography
							>
						</Typography>
					</Vertical>

					<Vertical class="vertical-trial-info" --vertical-gap="var(--padding)">
						<Horizontal --horizontal-justify-content="space-between">
							<Typography --colors-ultra-high="var(--colors-light-base)"
								>{$_('common.amountChargedNow')}</Typography
							>
							<Typography --colors-ultra-high="var(--colors-light-base)"
								><Typography bold>0</Typography> {currency}</Typography
							>
						</Horizontal>
						<Typography variant="small" --colors-ultra-high="var(--colors-light-base)"
							>{$_('common.cancelBeforeTrialEnd', {
								values: { firstPaymentFormattedDate },
							})}</Typography
						>
					</Vertical>
				</Vertical>
			{/if}
			<Vertical --vertical-gap="var(--padding)" class="vertical-border">
				<Typography variant="h5"
					>{isTrial
						? $_('common.firstPaymentOnTemplate', { values: { date: firstPaymentFormattedDate } })
						: $_('common.amountDue')}</Typography
				>
				<Vertical --vertical-gap="0">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography>{$_('common.yearlyPlan')}</Typography>
						<Typography
							><Typography bold>{formatNumber(promotionalYearlyFee)}</Typography>
							{currency}</Typography
						>
					</Horizontal>
				</Vertical>
				<Typography variant="small">{$_('common.subscriptionAutoRenew')}</Typography>
			</Vertical>

			<Vertical --vertical-gap="var(--padding)" --vertical-align-items="flex-start">
				<Button
					dimension="compact"
					variant="strong"
					id="submit"
					onclick={onClickPay}
					disabled={payButtonDisabled}
				>
					<span id="button-text"
						>{isTrial ? $_('common.getStartedNow') : $_('common.proceedToPayment')}</span
					><ArrowRight size={24} />
				</Button>
				<Typography variant="small"
					>{$_('common.byProceedingYouAgree')} <a href="/terms">{$_('common.termsOfUse')}</a> and
					<a href="/privacy">{$_('common.privacyPolicy')}</a></Typography
				>
			</Vertical>
		{:else}
			<Vertical class="rounded-box trans-green-10" --vertical-gap="var(--padding)">
				<Typography
					variant="h4"
					--colors-ultra-high="var(--colors-high)"
					style="display: flex; gap: var(--half-padding)"
				>
					<CheckmarkFilled size={32} />
					{$_('common.yourSubscriptionIsActive')}</Typography
				>
				<Typography variant="small" --colors-ultra-high="var(--colors-high)">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('common.manageSubscriptionDetails', {
						values: {
							accountPaymentsLink: `<a href="${routes.ACCOUNT}">${$_('common.paymentAndBilling')}</a>`,
						},
					})}</Typography
				>
			</Vertical>
		{/if}
	</Vertical>
{/if}

<style lang="postcss">
	:global(.vertical-border) {
		border: 1px solid var(--colors-low);
		padding: var(--padding);
	}
	:global(.vertical-trial-info) {
		border-radius: var(--quarter-padding);
		padding: var(--padding);
		background-color: var(--colors-high);
	}
	:global(.max560) {
		max-width: 560px;
	}
	:global(.line-through) {
		text-decoration: line-through;
	}
	:global(.green) {
		color: var(--colors-high) !important;
	}
	:global(.center) {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		max-height: 100%;
		height: 100vh;
	}
	:global(.rounded-box) {
		border-radius: var(--quarter-padding);
		padding: var(--padding);
	}
	:global(.trans-green-10) {
		background-color: rgb(from var(--colors-high) r g b / 0.1) !important;
	}
</style>
