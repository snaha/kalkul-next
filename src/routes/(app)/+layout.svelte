<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import { locale, locales } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import Login from '$lib/components/login.svelte'
	import { get } from 'svelte/store'
	import { subscriptionStore } from '$lib/stores/subscription.svelte'
	import { goto } from '$app/navigation'
	import { loadSubscriptions } from '$lib/payments/load'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import { PUBLIC_DISABLE_PAYWALL } from '$env/static/public'
	import BetaLandingPage from '$lib/components/beta-landing-page.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'

	let { children } = $props()

	$effect(() => {
		const availableLocales = get(locales)
		if (
			authStore.user?.user_metadata.prefer_language &&
			availableLocales.includes(authStore.user.user_metadata.prefer_language)
		) {
			locale.set(authStore.user.user_metadata.prefer_language)
		}
	})

	$effect(() => {
		if (
			PUBLIC_DISABLE_PAYWALL !== 'yes' &&
			authStore.isLoggedIn &&
			!subscriptionStore.loading &&
			!subscriptionStore.data.some(
				(subscription) => subscription.status === 'active' || subscription.status === 'trialing',
			)
		) {
			goto(routes.PAYMENTS)
		}
	})

	$effect(() => {
		if (authStore.isLoggedIn && subscriptionStore.loading) {
			loadSubscriptions()
		}
	})
</script>

{#if authStore.loading}
	<ContentLayout>
		<Loader />
	</ContentLayout>
{:else if authStore.isLoggedIn}
	{#if subscriptionStore.loading}
		<ContentLayout>
			<Loader />
		</ContentLayout>
	{:else if PUBLIC_DISABLE_PAYWALL === 'yes' || subscriptionStore.getActiveSubscription()}
		{#if children}
			{@render children()}
		{/if}
	{/if}
{:else if page.url.pathname !== routes.HOME && !layoutStore.mobile}
	<Login />
{:else}
	<BetaLandingPage isMobile={layoutStore.mobile} />
{/if}
