<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import Login from '$lib/components/login.svelte'
	import { subscriptionStore } from '$lib/stores/subscription.svelte'
	import { goto } from '$app/navigation'
	import { loadSubscriptions } from '$lib/payments/load'
	import { PUBLIC_DISABLE_PAYWALL } from '$env/static/public'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import LandingPage from '$lib/components/landing-page.svelte'

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
	<Fullscreen centerAlign>
		<Loader />
	</Fullscreen>
{:else if authStore.isLoggedIn}
	{#if subscriptionStore.loading}
		<Fullscreen centerAlign>
			<Loader />
		</Fullscreen>
	{:else if PUBLIC_DISABLE_PAYWALL === 'true' || subscriptionStore.getActiveSubscription()}
		{#if children}
			{@render children()}
		{/if}
	{/if}
{:else if page.url.pathname !== routes.HOME && !layoutStore.mobile}
	<Login />
{:else}
	<LandingPage isMobile={layoutStore.mobile} />
{/if}
