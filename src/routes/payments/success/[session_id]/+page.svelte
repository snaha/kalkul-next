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
	import routes from '$lib/routes'
	import { authorizedFetch } from '$lib/auth'
	import { base } from '$app/paths'

	let subscription: Stripe.Subscription | undefined = $state()
	const isTrial = $derived(subscription?.status === 'trialing')
	const yearlyFee = $derived((subscription?.items.data[0].price.unit_amount ?? 0) / 100)
	const currency = $derived(subscription?.items.data[0].price.currency.toUpperCase())
	const sessionId = $derived(page.params.session_id)

	async function onClick() {
		goto(routes.HOME)
	}

	async function openStripeSessionPortal() {
		const response = await authorizedFetch(`/api/payments/portal/${sessionId}`)
		if (!response.ok) {
			throw new Error('invalid response', { cause: response })
		}

		const { url } = await response.json()

		window.open(url)
	}

	onMount(async () => {
		subscription = subscriptionStore.getActiveSubscription()
	})
</script>

<Vertical class="max560" --vertical-gap="var(--double-padding)">
	{#if !subscription}
		<Vertical --vertical-align-items="center">
			{$_('There was an error')}
			<Typography>Session: {sessionId}</Typography>
			<Button variant="strong" dimension="compact" onclick={openStripeSessionPortal}>
				{$_('Manage subscription')}<ArrowRight size={24} />
			</Button>
		</Vertical>
	{:else}
		<Horizontal --horizontal-justify-content="center">
			<img src={`${base}/hand-success.svg`} alt="success" width="142" height="200" />
		</Horizontal>
		{#if isTrial}
			<Horizontal --horizontal-justify-content="center">
				<Typography variant="large" bold class="green"
					>{$_('Yes! Your free trial is now active!')}</Typography
				>
			</Horizontal>
			<Vertical --vertical-gap="var(--padding)">
				<Vertical class="green-bg" --vertical-gap="var(--padding)">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography --colors-ultra-high="var(--colors-base)"
							>{$_('Amount charged now')}</Typography
						>
						<Typography --colors-ultra-high="var(--colors-base)"
							><Typography bold>{yearlyFee}</Typography> {currency}</Typography
						>
					</Horizontal>
				</Vertical>
				<Vertical class="green-bg trans-10" --vertical-gap="var(--padding)">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography --colors-ultra-high="var(--colors-high)">{$_('Free trial')}</Typography>
						<Typography --colors-ultra-high="var(--colors-high)"
							><Typography bold>14</Typography> {$_('days remaining')}</Typography
						>
					</Horizontal>
					<Vertical --vertical-gap="var(--padding)">
						<Typography variant="small" --colors-ultra-high="var(--colors-high)"
							>{$_(
								'Cancel before Dec. 9, 2024 and you won’t be charged. You will be reminded via email 7 days before your trial period ends.',
							)}</Typography
						>
						<Typography variant="small" --colors-ultra-high="var(--colors-high)">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html $_(
								'You can view and manage your subscription details on the {accountPaymentsLink} page, accessible at anytime in your account settings.',
								{
									values: {
										accountPaymentsLink: `<a href="${routes.ACCOUNT}">${$_('Payment & billing')}</a>`,
									},
								},
							)}</Typography
						>
					</Vertical>
				</Vertical>
			</Vertical>
		{:else}
			<Vertical --vertical-gap="var(--half-padding)">
				<Horizontal --horizontal-justify-content="center">
					<Typography variant="large" bold class="green">{$_('Payment successful')}</Typography>
				</Horizontal>
				<Horizontal --horizontal-justify-content="center">
					<Typography variant="large">{$_('Thank you for using Kalkul!')}</Typography>
				</Horizontal>
			</Vertical>
			<Vertical --vertical-gap="var(--padding)">
				<Vertical class="green-bg" --vertical-gap="var(--padding)">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography --colors-ultra-high="var(--colors-base)"
							>{$_('Amount charged now')}</Typography
						>
						<Typography --colors-ultra-high="var(--colors-base)"
							><Typography bold>{yearlyFee}</Typography> {currency}</Typography
						>
					</Horizontal>
				</Vertical>
				<Vertical class="green-bg trans-10" --vertical-gap="var(--padding)">
					<Horizontal --horizontal-justify-content="space-between">
						<Typography --colors-ultra-high="var(--colors-high)">{$_('Yearly plan')}</Typography>
						<Typography --colors-ultra-high="var(--colors-high)"
							><Typography bold>{yearlyFee}</Typography> {currency}</Typography
						>
					</Horizontal>
					<Vertical --vertical-gap="var(--padding)">
						<Typography variant="small" --colors-ultra-high="var(--colors-high)"
							>{$_(
								'Your subscription will automatically renew annually on a recurring basis.',
							)}</Typography
						>
						<Typography variant="small" --colors-ultra-high="var(--colors-high)">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html $_(
								'You can view and manage your subscription details on the {accountPaymentsLink} page, accessible at anytime in your account settings.',
								{
									values: {
										accountPaymentsLink: `<a href="${routes.ACCOUNT}">${$_('Payment & billing')}</a>`,
									},
								},
							)}</Typography
						>
					</Vertical>
				</Vertical>
			</Vertical>
		{/if}
		<Horizontal --horizontal-justify-content="center">
			<Button variant="strong" dimension="compact" onclick={onClick}>
				{$_('Start using Kalkul')}<ArrowRight size={24} />
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
