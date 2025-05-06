<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import adapters from '$lib/adapters'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import ErrorComponent from '$lib/components/error.svelte'
	import Header from '$lib/components/header.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import FlexItem from '$lib/components/ui/flex-item.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
	import Select from '$lib/components/ui/select/select.svelte'
	import TabBar from '$lib/components/ui/tab-bar/tab-bar.svelte'
	import TabContent from '$lib/components/ui/tab-bar/tab-content.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import { notImplemented } from '$lib/not-implemented'
	import routes, { apiRoutes } from '$lib/routes'
	import { authStore } from '$lib/stores/auth.svelte'
	import { subscriptionStore } from '$lib/stores/subscription.svelte'
	import { formatNumber } from '$lib/utils'
	import {
		ArrowLeft,
		ArrowRight,
		CheckmarkFilled,
		Receipt,
		User,
		WarningFilled,
	} from 'carbon-icons-svelte'
	import { differenceInDays } from 'date-fns'
	import { locale, _, locales } from 'svelte-i18n'
	import Stripe from 'stripe'
	import { authorizedFetch } from '$lib/auth'
	import { PUBLIC_DISABLE_PAYWALL } from '$env/static/public'

	let error: string | undefined = $state()
	const subscription: Stripe.Subscription | undefined = $derived(subscriptionStore.data[0])
	const isTrial = $derived(subscription?.status === 'trialing')
	const currency = $derived(subscription?.currency.toUpperCase())
	const nextPaymentFormattedDate = $derived(
		new Date(
			((isTrial ? subscription?.trial_end : subscription?.current_period_end) ?? 0) * 1000,
		).toLocaleDateString(undefined, {
			dateStyle: 'medium',
		}),
	)
	const yearlyFee = $derived((subscription?.items.data[0].price.unit_amount ?? 0) / 100)
	const trialRemainingDays = $derived(
		isTrial ? differenceInDays(new Date((subscription?.trial_end ?? 0) * 1000), new Date()) - 1 : 0,
	)

	const languageName: Record<string, string> = {
		en: 'English',
		cs: 'Čeština',
	}

	locale.subscribe((newLocale) => {
		if (browser && newLocale) {
			error = undefined
			adapters.updateLanguage(newLocale).catch((error) => {
				error = $_('updateLanguageError')
				console.error('Failed to update language', error)
			})
			if (authStore.user) authStore.user.user_metadata.prefer_language = newLocale
		}
	})

	async function manageSubscriptions() {
		const customer = subscriptionStore.customer
		if (!customer) {
			throw new Error('invalid customer id', { cause: customer })
		}

		const response = await authorizedFetch(apiRoutes.PORTAL_CUSTOMER(customer))
		if (!response.ok) {
			throw new Error('customer portal call failed', { cause: response })
		}

		const { url } = await response.json()
		if (!url) {
			throw new Error('invalid checkout url', { cause: url })
		}

		window.open(url)
	}

	function isPaymentEnabled() {
		return PUBLIC_DISABLE_PAYWALL !== 'yes'
	}
</script>

{#snippet nextPayment()}
	<Vertical --vertical-gap="var(--padding)" class="vertical-border">
		<Typography variant="h5"
			>{isTrial
				? $_('First payment on {date}', { values: { date: nextPaymentFormattedDate } })
				: $_('Next payment on {date}', {
						values: { date: nextPaymentFormattedDate },
					})}</Typography
		>
		<Vertical --vertical-gap="0">
			<Horizontal --horizontal-justify-content="space-between">
				<Typography>{$_('Yearly plan')}</Typography>
				<Typography
					><Typography bold>{formatNumber(yearlyFee)}</Typography>
					{currency}</Typography
				>
			</Horizontal>
		</Vertical>
		<Typography variant="small"
			>{$_('Your subscription will automatically renew annually on a recurring basis.')}</Typography
		>
	</Vertical>
	<Horizontal --horizontal-justify-content="flex-start">
		<Button variant="strong" dimension="compact" onclick={manageSubscriptions}
			>{$_('Manage subscription')}<ArrowRight size={24} /></Button
		>
	</Horizontal>
{/snippet}

<Header />
<ContentLayout>
	<Vertical class="max560" --vertical-gap="var(--double-padding)">
		<Horizontal --horizontal-gap="var(--half-padding)">
			<Button variant="ghost" dimension="compact" onclick={() => goto(routes.HOME)}
				><ArrowLeft size={24} /></Button
			>
			<Typography variant="h4">{$_('Settings')}</Typography>
		</Horizontal>
		<TabBar
			dimension="compact"
			ulClass="account-tabbar"
			liClass="account-tab-li"
			buttonClass="account-tab-button"
		>
			<TabContent>
				{#snippet value()}
					<User size={24} />{$_('Account')}
				{/snippet}
				<Vertical --vertical-gap="var(--padding)">
					<Vertical --vertical-gap="var(--quarter-padding)">
						{#if $locale}
							<Select
								bind:value={$locale}
								label={$_('language')}
								dimension="compact"
								layout="vertical"
							>
								{#each $locales as locale}
									<Option value={locale}>{languageName[locale]}</Option>
								{/each}
							</Select>
							{#if error}
								<ErrorComponent>{error}</ErrorComponent>
							{/if}
						{/if}
					</Vertical>
					<Input label={$_('emailAddress')} value={authStore.user?.email} disabled />
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Button dimension="compact" href={routes.ACCOUNT_CHANGE_EMAIL} variant="secondary"
							>{$_('changeEmailAddress')}</Button
						>
						<Button dimension="compact" href={routes.ACCOUNT_CHANGE_PASSWORD} variant="secondary"
							>{$_('changePassword')}</Button
						>
						<FlexItem />
						<Button
							dimension="compact"
							variant="ghost"
							onclick={(e: Event) =>
								notImplemented(e, $_('Contact support to delete your account with all its data'))}
							>{$_('Delete account')}</Button
						>
					</Horizontal>
				</Vertical>
			</TabContent>
			<TabContent>
				{#snippet value()}
					<Receipt size={24} />{$_('Payment & billing')}
				{/snippet}
				<Vertical --vertical-gap="var(--padding)">
					{#if subscription?.status === 'active'}
						<Vertical class="rounded-box trans-green-10" --vertical-gap="var(--padding)">
							<Typography
								variant="h4"
								--colors-ultra-high="var(--colors-high)"
								style="display: flex; gap: var(--half-padding)"
							>
								<CheckmarkFilled size={32} />
								{$_('Your subscription is active')}</Typography
							>
							<Typography variant="small" --colors-ultra-high="var(--colors-high)">
								{$_(
									'To review your payment & billing details or manage anything about your subscription, please use the button below.',
								)}
							</Typography>
						</Vertical>
						{@render nextPayment()}
					{:else if subscription?.status === 'trialing'}
						<Vertical class="rounded-box trans-green-10" --vertical-gap="var(--padding)">
							<Horizontal --horizontal-justify-content="space-between">
								<Typography variant="h4" --colors-ultra-high="var(--colors-high)"
									>{$_('Free trial')}</Typography
								>
								{#if trialRemainingDays === 0}
									<Typography --colors-ultra-high="var(--colors-high)" bold
										>{$_('Expiring today')}</Typography
									>
								{:else}
									<Typography --colors-ultra-high="var(--colors-high)"
										><Typography bold>{trialRemainingDays}</Typography>
										{$_('{days} remaining', {
											values: { days: trialRemainingDays > 1 ? $_('days') : $_('day') },
										})}</Typography
									>
								{/if}
							</Horizontal>
							<Vertical --vertical-gap="var(--padding)">
								<Vertical --vertical-gap="0">
									<Typography variant="small" bold --colors-ultra-high="var(--colors-high)">
										{$_('Cancel before {date} and you won’t be charged.', {
											values: { date: nextPaymentFormattedDate },
										})}
									</Typography>
									<Typography variant="small" --colors-ultra-high="var(--colors-high)">
										{$_(
											'We will remind you via email 7 days before your trial period ends. To review your payment & billing details or manage anything about your subscription, please use the button below.',
										)}</Typography
									>
								</Vertical>
							</Vertical>
						</Vertical>
						{@render nextPayment()}
					{:else if isPaymentEnabled()}
						<Vertical class="rounded-box trans-red-10" --vertical-gap="var(--padding)">
							<Typography
								variant="h4"
								--colors-ultra-high="var(--colors-red)"
								style="display: flex; gap: var(--half-padding)"
							>
								<WarningFilled size={32} />
								{$_('No active subscription')}</Typography
							>
						</Vertical>
						<Horizontal --horizontal-justify-content="space-between">
							<Typography>You need a subscription to use Kalkul</Typography>
							<FlexItem />
							<Button variant="strong" dimension="compact" onclick={() => goto(routes.PAYMENTS)}
								>{$_('Subscribe now')}<ArrowRight size={24} /></Button
							>
						</Horizontal>
					{:else}
						<Vertical class="rounded-box trans-neutral-10" --vertical-gap="var(--padding)">
							<Typography
								variant="h4"
								--colors-ultra-high="var(--colors-high-neutral)"
								style="display: flex; gap: var(--half-padding)"
							>
								<CheckmarkFilled size={32} />
								{$_('Free Beta')}</Typography
							>
						</Vertical>
					{/if}
				</Vertical>
			</TabContent>
		</TabBar>
	</Vertical>
</ContentLayout>

<style lang="postcss">
	:global(.fit-content) {
		width: fit-content;
	}
	:global(.max560) {
		max-width: 560px;
		width: 100%;
	}
	:global(.account-tabbar) {
		justify-content: space-between;
		background-color: var(--colors-base);
		border: 1px solid var(--colors-low);
		gap: var(--quarter-padding);
		border-radius: var(--quarter-padding);
		padding: var(--quarter-padding) !important;
		margin-bottom: var(--double-padding) !important;
	}
	:global(.account-tab-li) {
		display: flex;
		flex: 1;
	}
	:global(.account-tab-button) {
		flex-grow: 1 !important;
	}
	:global(.vertical-border) {
		border: 1px solid var(--colors-low);
		border-radius: var(--quarter-padding);
		padding: var(--padding);
	}
	:global(.rounded-box) {
		border-radius: var(--quarter-padding);
		padding: var(--padding);
	}
	:global(.trans-green-10) {
		background-color: rgb(from var(--colors-high) r g b / 0.1) !important;
	}
	:global(.trans-red-10) {
		background-color: rgb(from var(--colors-red) r g b / 0.1) !important;
	}
	:global(.trans-neutral-10) {
		background-color: rgb(from var(--colors-high-neutral) r g b / 0.1) !important;
	}
</style>
