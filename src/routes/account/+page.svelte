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
				error = $_('page.account.errorFailedToUpdateLanguage')
				console.error('Failed to update language', error) // TODO: consider if this needs translation
			})
			// FIXME: handle the case when the user is not logged in
			if (authStore.user) authStore.user.user_metadata.prefer_language = newLocale
		}
	})

	async function manageSubscriptions() {
		const customer = subscriptionStore.customer
		if (!customer) {
			throw new Error('invalid customer id', { cause: customer }) // TODO: consider if this needs translation
		}

		const response = await authorizedFetch(apiRoutes.PORTAL_CUSTOMER(customer))
		if (!response.ok) {
			throw new Error('customer portal call failed', { cause: response }) // TODO: consider if this needs translation
		}

		const { url } = await response.json()
		if (!url) {
			throw new Error('invalid checkout url', { cause: url }) // TODO: consider if this needs translation
		}

		window.open(url)
	}

	function isPaymentEnabled() {
		return PUBLIC_DISABLE_PAYWALL !== 'true'
	}
</script>

{#snippet nextPayment()}
	<Vertical --vertical-gap="var(--padding)" class="vertical-border">
		<Typography variant="h5"
			>{isTrial
				? $_('page.account.firstPaymentOn', { values: { date: nextPaymentFormattedDate } })
				: $_('page.account.nextPaymentOn', {
						values: { date: nextPaymentFormattedDate },
					})}</Typography
		>
		<Vertical --vertical-gap="0">
			<Horizontal --horizontal-justify-content="space-between">
				<Typography>{$_('page.account.yearlyPlan')}</Typography>
				<Typography
					><Typography bold>{formatNumber(yearlyFee, $locale)}</Typography>
					{currency}</Typography
				>
			</Horizontal>
		</Vertical>
		<Typography variant="small">{$_('page.account.subscriptionDisclaimer')}</Typography>
	</Vertical>
	<Horizontal --horizontal-justify-content="flex-start">
		<Button variant="strong" dimension="compact" onclick={manageSubscriptions}
			>{$_('page.account.manageSubscription')}<ArrowRight size={24} /></Button
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
			<Typography variant="h4">{$_('page.account.settings')}</Typography>
		</Horizontal>
		<TabBar
			dimension="compact"
			ulClass="account-tabbar"
			liClass="account-tab-li"
			buttonClass="account-tab-button"
		>
			<TabContent>
				{#snippet value()}
					<User size={24} />{$_('page.account.account')}
				{/snippet}
				<Vertical --vertical-gap="var(--padding)">
					<Vertical --vertical-gap="var(--quarter-padding)">
						{#if $locale}
							<Select
								bind:value={$locale}
								label={$_('page.account.language')}
								dimension="compact"
								layout="vertical"
								items={$locales.map((locale) => ({ value: locale, label: languageName[locale] }))}
							></Select>
							{#if error}
								<ErrorComponent>{error}</ErrorComponent>
							{/if}
						{/if}
					</Vertical>
					<Input label={$_('common.email')} value={authStore.user?.email} disabled />
					<Horizontal --horizontal-gap="var(--half-padding)">
						<Button dimension="compact" href={routes.ACCOUNT_CHANGE_EMAIL} variant="secondary"
							>{$_('page.account.changeEmailAddress')}</Button
						>
						<Button dimension="compact" href={routes.ACCOUNT_CHANGE_PASSWORD} variant="secondary"
							>{$_('page.account.changePassword')}</Button
						>
						<FlexItem />
						<Button
							dimension="compact"
							variant="ghost"
							onclick={(e: Event) => notImplemented(e, $_('page.account.deleteAccountWarning'))}
							>{$_('page.account.deleteAccountButton')}</Button
						>
					</Horizontal>
				</Vertical>
			</TabContent>
			<TabContent>
				{#snippet value()}
					<Receipt size={24} />{$_('common.paymentAndBilling')}
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
								{$_('page.account.activeSubscription')}</Typography
							>
							<Typography variant="small" --colors-ultra-high="var(--colors-high)">
								{$_('page.account.activeSubscriptionNote')}
							</Typography>
						</Vertical>
						{@render nextPayment()}
					{:else if subscription?.status === 'trialing'}
						<Vertical class="rounded-box trans-green-10" --vertical-gap="var(--padding)">
							<Horizontal --horizontal-justify-content="space-between">
								<Typography variant="h4" --colors-ultra-high="var(--colors-high)"
									>{$_('page.account.freeTrial')}</Typography
								>
								{#if trialRemainingDays === 0}
									<Typography --colors-ultra-high="var(--colors-high)" bold
										>{$_('page.account.expiringToday')}</Typography
									>
								{:else}
									<Typography --colors-ultra-high="var(--colors-high)"
										><Typography bold>{trialRemainingDays}</Typography>
										{$_('page.account.expiringIn', {
											values: { count: trialRemainingDays },
										})}</Typography
									>
								{/if}
							</Horizontal>
							<Vertical --vertical-gap="var(--padding)">
								<Vertical --vertical-gap="0">
									<Typography variant="small" bold --colors-ultra-high="var(--colors-high)">
										{$_('page.account.cancelBeforeDate', {
											values: { date: nextPaymentFormattedDate },
										})}
									</Typography>
									<Typography variant="small" --colors-ultra-high="var(--colors-high)">
										{$_('page.account.cancelReminder')}</Typography
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
								{$_('page.account.noActiveSubscription')}</Typography
							>
						</Vertical>
						<Horizontal --horizontal-justify-content="space-between">
							<Typography>{$_('page.account.needSubscription')}</Typography>
							<FlexItem />
							<Button variant="strong" dimension="compact" onclick={() => goto(routes.PAYMENTS)}
								>{$_('page.account.subscribeNow')}<ArrowRight size={24} /></Button
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
								{$_('page.account.freeBeta')}</Typography
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
