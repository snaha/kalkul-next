<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { ArrowRight } from 'carbon-icons-svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import UpdatePassword from '$lib/components/update-password.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Registration from '$lib/components/registration.svelte'
	import Login from '$lib/components/login.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import { _ } from 'svelte-i18n'
	let { children } = $props()

	let screen: 'intro' | 'login' | 'registration' = $state('intro')
</script>

{#if authStore.loading}
	<div class="center">
		<Loader />
	</div>
{:else if authStore.isLoggedIn}
	{#if children}
		{@render children()}
	{/if}
{:else if authStore.passwordRecovery}
	<UpdatePassword />
{:else if screen === 'intro'}
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
				<Button onclick={() => (screen = 'registration')}>{$_('signUp')}</Button>
				<Button onclick={() => (screen = 'login')} variant="secondary"
					>{$_('login')}<ArrowRight size={24} /></Button
				>
			</div>
		</div>
		<div class="image">
			<img src="/intro-image.png" alt="bird" width="100%" />
		</div>
	</div>
{:else if screen === 'registration'}
	<Registration
		login={() => {
			screen = 'login'
		}}
		cancel={() => (screen = 'intro')}
	/>
{:else if screen === 'login'}
	<Login
		signIn={() => (screen = 'intro')}
		register={() => {
			screen = 'registration'
		}}
		cancel={() => (screen = 'intro')}
	/>
{/if}

<style lang="postcss">
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
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
