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
{:else if isInstagramBrowser}
	<!-- Simple fallback for Instagram in-app browser -->
	<div
		style="padding: 20px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;"
	>
		<h1>Kalkul</h1>
		<p>Financial Portfolio Management</p>
		<a
			href="/signup"
			style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px;"
			>Get Started</a
		>
		<a
			href="/login"
			style="display: inline-block; padding: 10px 20px; border: 1px solid #007bff; color: #007bff; text-decoration: none; border-radius: 5px; margin: 10px;"
			>Login</a
		>
		<small style="margin-top: 20px; color: #666;"
			>For the best experience, open this link in your browser</small
		>
	</div>
{:else}
	<BetaLandingPage isMobile={layoutStore.mobile} />
{/if}
