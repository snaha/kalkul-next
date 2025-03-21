<script lang="ts">
	import { goto } from '$app/navigation'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import { loadSubscriptions } from '$lib/payments/load'
	import routes from '$lib/routes'
	import { authStore } from '$lib/stores/auth.svelte'
	import { subscriptionStore } from '$lib/stores/subscription.svelte'

	let { children } = $props()

	const loading = $derived(authStore.loading || subscriptionStore.loading)

	$effect(() => {
		if (!authStore.loading && !authStore.isLoggedIn) {
			goto(routes.LOGIN)
		}
	})

	$effect(() => {
		if (authStore.isLoggedIn && subscriptionStore.loading) {
			loadSubscriptions()
		}
	})
</script>

{#if loading}
	<ContentLayout>
		<Loader />
	</ContentLayout>
{:else if authStore.isLoggedIn}
	{#if children}
		{@render children()}
	{/if}
{/if}
