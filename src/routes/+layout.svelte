<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import '../app.pcss'
	import adapter from '$lib/adapters'
	import Registration from '$lib/components/registration.svelte'
	import LogIn from '$lib/components/login.svelte'

	let { children } = $props()

	let registration: boolean = $state(false)
	const isLoggedIn = $derived(adapter.authStore.isLoggedIn)

	onMount(async () => {
		console.debug(isLoggedIn)
		await adapter.start()
		console.debug('after', isLoggedIn)
	})
	onDestroy(() => {
		adapter.stop()
	})
</script>

{#if !isLoggedIn}
	{#if registration}
		<Registration login={() => (registration = false)} />
	{:else}
		<LogIn register={() => (registration = true)} />
	{/if}
{:else if children}
	{@render children()}
{/if}
