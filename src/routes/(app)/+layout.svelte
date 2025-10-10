<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import Login from '$lib/components/login.svelte'
	import { subscriptionStore } from '$lib/stores/subscription.svelte'
	import { goto } from '$app/navigation'
	import { loadSubscriptions } from '$lib/payments/load'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import { PUBLIC_DISABLE_PAYWALL } from '$env/static/public'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import BetaLandingPage from '$lib/components/beta-landing-page.svelte'

	let { children } = $props()

	$effect(() => {
		if (
			PUBLIC_DISABLE_PAYWALL !== 'true' &&
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
	{:else if PUBLIC_DISABLE_PAYWALL === 'true' || subscriptionStore.getActiveSubscription()}
		{#if children}
			{@render children()}
		{/if}
	{/if}
{:else if page.url.pathname !== routes.HOME && !layoutStore.mobile}
	<Login />
{:else}
	<BetaLandingPage isMobile={layoutStore.mobile} />
{/if}
