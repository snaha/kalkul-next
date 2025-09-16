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
	import BetaLandingPage from '$lib/components/beta-landing-page.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
	import { browser } from '$app/environment'

	let { children } = $props()

	// Check if user is on Instagram's in-app browser
	let isInstagramBrowser = $derived(
		browser && navigator.userAgent && navigator.userAgent.includes('Instagram'),
	)

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

{#if browser && navigator.userAgent?.includes('Instagram')}
	<!-- Instagram in-app browser - show simple fallback immediately -->
	<div
		style="padding: 20px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; font-family: Arial, sans-serif;"
	>
		<h1 style="color: #333;">Kalkul</h1>
		<p style="color: #666; margin: 20px 0;">Financial Portfolio Management</p>
		<a
			href="/signup"
			style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 8px; font-weight: 500;"
			>Get Started</a
		>
		<a
			href="/login"
			style="display: inline-block; padding: 12px 24px; border: 2px solid #007bff; color: #007bff; text-decoration: none; border-radius: 6px; margin: 8px; font-weight: 500;"
			>Login</a
		>
		<small style="margin-top: 30px; color: #999; line-height: 1.4;"
			>For the best experience, tap the "..." menu<br />and select "Open in Browser"</small
		>
	</div>
{:else if authStore.loading}
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
