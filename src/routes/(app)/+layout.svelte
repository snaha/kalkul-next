<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { ArrowRight } from 'carbon-icons-svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import { _, locale, locales } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { page } from '$app/state'
	import Login from '$lib/components/login.svelte'
	import { get } from 'svelte/store'
	import { base } from '$app/paths'
	import { subscriptionStore } from '$lib/stores/subscription.svelte'
	import { goto } from '$app/navigation'
	import { loadSubscriptions } from '$lib/payments/load'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import { PUBLIC_DISABLE_PAYWALL } from '$env/static/public'

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
{:else if page.url.pathname !== routes.HOME}
	<Login />
{:else}
	<div class="intro-screen">
		<div class="intro-banner">
			<div class="logo">
				<img src={`${base}/logo.svg`} alt="Logo" />
			</div>
			<div class="info">
				<Typography variant="h1">Envision financial freedom</Typography>
				<Typography variant="large"
					>Kalkul helps financial advisors create, visualise and share beautifully clear investment
					plans with their clients.</Typography
				>
			</div>
			<div class="buttons">
				<Button href={routes.SIGNUP}>{$_('signUp')}</Button>
				<Button href={routes.LOGIN} variant="secondary"
					>{$_('login')}<ArrowRight size={24} /></Button
				>
			</div>
		</div>
		<div class="image">
			<img src={`${base}/capa2.svg`} alt="intro" width="100%" />
		</div>
	</div>
{/if}

<style lang="postcss">
	.intro-screen {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--padding);
		height: 100vh;
		padding: var(--padding);
		flex-wrap: wrap;
	}
	.intro-banner {
		display: flex;
		flex-direction: column;
		gap: var(--double-padding);
		width: 560px;
	}
	.logo {
		width: 80px;
		height: 96px;
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
	.image {
		display: flex;
		justify-content: center;
		width: 560px;
	}
	.buttons {
		display: flex;
		gap: var(--half-padding);
	}
</style>
