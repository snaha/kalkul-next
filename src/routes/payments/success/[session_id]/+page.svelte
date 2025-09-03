<script lang="ts">
	import { page } from '$app/state'
	import Button from '$lib/components/ui/button.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import { subscriptionStore } from '$lib/stores/subscription.svelte'
	import { ArrowRight } from 'carbon-icons-svelte'
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'
	import Stripe from 'stripe'
	import { goto } from '$app/navigation'
	import routes, { apiRoutes } from '$lib/routes'
	import { authorizedFetch } from '$lib/auth'
	import { base } from '$app/paths'

	let subscription: Stripe.Subscription | undefined = $state()
	const isTrial = $derived(subscription?.status === 'trialing')
	const yearlyFee = $derived((subscription?.items.data[0].price.unit_amount ?? 0) / 100)
	const currency = $derived(subscription?.items.data[0].price.currency.toUpperCase())
	const sessionId = $derived(page.params.session_id)
	const firstPaymentFormattedDate = $derived(
		new Date(
			((isTrial ? subscription?.trial_end : subscription?.current_period_end) ?? 0) * 1000,
		).toLocaleDateString(undefined, {
			dateStyle: 'medium',
		}),
	)

	async function onClick() {
		goto(routes.HOME)
	}

	async function openStripeSessionPortal() {
		const response = await authorizedFetch(apiRoutes.PORTAL(sessionId))
		if (!response.ok) {
			throw new Error('invalid response', { cause: response })
		}

		const { url } = await response.json()

		window.open(url)
	}

	onMount(async () => {
		subscription = subscriptionStore.getActiveSubscription()
		if (subscription) {
			return
		}

		// There is a race condition where Stripe returns successfully after payment
		// but the customer is not yet indexed by their email address, therefore the
		// subscriptionStore is not loaded yet.
		// In this case we load the subscriptionStore by querying the data
		// based on the sessionId
		await loadSubscriptionStoreBySession()
	})

	async function loadSubscriptionStoreBySession() {
		const response = await authorizedFetch(apiRoutes.SUCCESS(sessionId))
		if (!response.ok) {
			throw new Error('subscription cannot be loaded', { cause: response })
		}

		const subscriptionResponse = await response.json()
		subscription = subscriptionResponse.subscription

		if (!subscription) {
			throw new Error('subscription not found', { cause: subscriptionResponse })
		}

		const customer = subscription?.customer
		if (!customer) {
			subscription = undefined
			throw new Error('customer not found', { cause: subscriptionResponse })
		}

		const customerId = typeof customer === 'string' ? customer : customer.id

		subscriptionStore.data = [subscription]
		subscriptionStore.customer = customerId
	}
</script>

<Vertical class="max560" --vertical-gap="var(--double-padding)">
	{#if !subscription}
		<Vertical --vertical-align-items="center">
			{$_('common.thereWasAnError')}
			<Typography>Session: {sessionId}</Typography>
			<Button variant="strong" dimension="compact" onclick={openStripeSessionPortal}>
				{$_('common.manageSubscription')}<ArrowRight size={24} />
			</Button>
		</Vertical>
	{:else}
		{#if isTrial}
			<Horizontal --horizontal-justify-content="center">
				<img
					src={`${base}/images/hand-success.svg`}
					alt={$_('common.success')}
					width="256"
					height="256"
				/>
			</Horizontal>
			<Horizontal --horizontal-justify-content="center">
				<Typography variant="large" bold class="green"
					>{$_('common.yesFreeTrialNowActive')}</Typography
				>
			</Horizontal>
			<Vertical --vertical-gap="var(--padding)">
				<Vertical class="green-bg" --vertical-gap="var(--padding)">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography --colors-ultra-high="var(--colors-base)"
							>{$_('common.amountChargedNow')}</Typography
						>
						<Typography --colors-ultra-high="var(--colors-base)"
							><Typography bold>{yearlyFee}</Typography> {currency}</Typography
						>
					</Horizontal>
				</Vertical>
				<Vertical class="green-bg trans-10" --vertical-gap="var(--padding)">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography --colors-ultra-high="var(--colors-high)"
							>{$_('common.freeTrial')}</Typography
						>
						<Typography --colors-ultra-high="var(--colors-high)"
							><Typography bold>14</Typography> {$_('common.daysRemaining')}</Typography
						>
					</Horizontal>
					<Vertical --vertical-gap="var(--padding)">
						<Typography variant="small" --colors-ultra-high="var(--colors-high)"
							>{$_('common.cancelBeforeTrialEnd', {
								values: { firstPaymentFormattedDate },
							})}</Typography
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
				</Vertical>
			</Vertical>
		{:else}
			<Vertical --vertical-gap="var(--half-padding)">
				<Horizontal --horizontal-justify-content="center">
					<img
						src={`${base}/images/payment-success.svg`}
						alt={$_('common.success')}
						width="256"
						height="256"
					/>
				</Horizontal>
				<Horizontal --horizontal-justify-content="center">
					<Typography variant="large" bold class="green"
						>{$_('common.paymentSuccessful')}</Typography
					>
				</Horizontal>
				<Horizontal --horizontal-justify-content="center">
					<Typography variant="large">{$_('common.thankYouForUsingKalkul')}</Typography>
				</Horizontal>
			</Vertical>
			<Vertical --vertical-gap="var(--padding)">
				<Vertical class="green-bg" --vertical-gap="var(--padding)">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography --colors-ultra-high="var(--colors-base)"
							>{$_('common.amountChargedNow')}</Typography
						>
						<Typography --colors-ultra-high="var(--colors-base)"
							><Typography bold>{yearlyFee}</Typography> {currency}</Typography
						>
					</Horizontal>
				</Vertical>
				<Vertical class="green-bg trans-10" --vertical-gap="var(--padding)">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography --colors-ultra-high="var(--colors-high)"
							>{$_('common.yearlyPlan')}</Typography
						>
						<Typography --colors-ultra-high="var(--colors-high)"
							><Typography bold>{yearlyFee}</Typography> {currency}</Typography
						>
					</Horizontal>
					<Vertical --vertical-gap="var(--padding)">
						<Typography variant="small" --colors-ultra-high="var(--colors-high)"
							>{$_('common.subscriptionAutoRenew')}</Typography
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
				</Vertical>
			</Vertical>
		{/if}
		<Horizontal --horizontal-justify-content="center">
			<Button variant="strong" dimension="compact" onclick={onClick}>
				{$_('common.startUsingKalkul')}<ArrowRight size={24} />
			</Button>
		</Horizontal>
	{/if}
</Vertical>

<style lang="postcss">
	:global(.green) {
		color: var(--colors-high) !important;
	}
	:global(.green-bg) {
		border-radius: var(--quarter-padding);
		padding: var(--padding);
		background-color: var(--colors-high);
	}
	:global(.trans-10) {
		background-color: rgb(from var(--colors-high) r g b / 0.1) !important;
	}
	:global(.max560) {
		max-width: 560px;
	}
	:global(.green-bg) {
		border-radius: var(--quarter-padding);
		padding: var(--padding);
		background-color: var(--colors-high);
	}
	:global(.trans-10) {
		background-color: rgb(from var(--colors-high) r g b / 0.1) !important;
	}
</style>
