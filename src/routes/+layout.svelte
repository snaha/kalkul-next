<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import '../app.pcss'
	import adapter from '$lib/adapters'
	import Registration from '$lib/components/registration.svelte'
	import LogIn from '$lib/components/login.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import { ArrowRight } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import UpdatePassword from '$lib/components/update-password.svelte'
	import { authStore } from '$lib/stores/auth.svelte'

	let { children } = $props()

	let login: boolean = $state(false)
	let registration: boolean = $state(false)
	let passwordRecovery: boolean = $derived(authStore.passwordRecovery)
	const isLoggedIn = $derived(authStore.isLoggedIn)
	let loggedOut: boolean = $derived(!isLoggedIn && !registration && !login && !passwordRecovery)
	onMount(() => {
		adapter.start()
	})
	onDestroy(() => {
		adapter.stop()
	})
</script>

{#if loggedOut}
	<div class="intro-screen">
		<div class="intro-banner">
			<div class="logo">
				<img src="/logo.svg" alt="Logo" />
			</div>
			<div class="info">
				<Typography variant="h1">Fingerstache mukbang</Typography>
				<Typography variant="large"
					>Viral meggings austin, chicharrones cray vinyl banjo pickled adaptogen bitters affogato
					cornhole vaporware messenger bag.</Typography
				>
			</div>
			<div class="buttons">
				<Button onclick={() => (registration = true)}>{$_('signUp')}</Button>
				<Button onclick={() => (login = true)} variant="secondary"
					>{$_('login')}<ArrowRight size={24} /></Button
				>
			</div>
		</div>
		<div class="image">
			<img src="/intro-image.png" alt="bird" width="100%" />
		</div>
	</div>
{:else if registration}
	<Registration
		login={() => {
			registration = false
			login = true
		}}
		cancel={() => (registration = false)}
	/>
{:else if login}
	<LogIn
		signIn={() => (login = false)}
		register={() => {
			login = false
			registration = true
		}}
		cancel={() => (login = false)}
	/>
{:else if passwordRecovery}
	<UpdatePassword />
{:else if children}
	{@render children()}
{/if}

<style lang="postcss">
	.intro-screen {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--padding);
		height: 100vh;
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
