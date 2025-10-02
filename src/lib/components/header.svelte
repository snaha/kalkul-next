<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Logo from '$lib/components/icons/logo.svelte'
	import { ChatBot, Logout, SettingsEdit, UserAvatarFilled } from 'carbon-icons-svelte'
	import adapter from '$lib/adapters'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import routes from '$lib/routes'
	import { _ } from 'svelte-i18n'
	import HelpModal from './help-modal.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	let showHelpModal = $state(false)

	function openSettings() {
		// Don't store return location if already on account page
		if (page.url.pathname === routes.ACCOUNT) {
			return
		}
		sessionStorage.setItem('settingsReturnTo', page.url.pathname + page.url.search)
		goto(routes.ACCOUNT)
	}

	async function logout() {
		await adapter.signOut()
		goto(routes.HOME)
	}
</script>

<header>
	<div class="left">
		<a class="logo-link" href={routes.HOME}>
			<Logo size={32} />
		</a>
	</div>

	<div class="user-info">
		<Button mode="dark" dimension="small" variant="ghost" onclick={() => (showHelpModal = true)}
			><ChatBot size={16} />{$_('component.header.helpButton')}</Button
		>

		<Dropdown buttonDimension="small" mode="dark" left>
			{#snippet button()}
				<UserAvatarFilled size={16} />{authStore.user?.email}
			{/snippet}
			<ul class="dropdown-menu">
				<Button variant="ghost" dimension="compact" onclick={openSettings} leftAlign>
					<SettingsEdit size={24} />
					{$_('component.header.accountSettings')}
				</Button>
				<Button variant="ghost" dimension="compact" onclick={logout} leftAlign>
					<Logout size={24} />
					{$_('common.logout')}
				</Button>
			</ul>
		</Dropdown>
	</div>
</header>
<HelpModal bind:open={showHelpModal} oncancel={() => (showHelpModal = false)} />

<style lang="postcss">
	header {
		padding: var(--half-padding);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--colors-dark-ultra-low);
		color: var(--colors-dark-ultra-high);
	}
	.left {
		display: flex;
		align-items: center;
		gap: var(--quarter-padding);
	}
	.logo-link {
		display: flex;
		color: var(--colors-dark-ultra-high);
	}
	.user-info {
		display: flex;
		gap: var(--half-padding);
	}
	.dropdown-menu {
		display: flex;
		flex-direction: column;
		width: auto;
		margin: 0;
		padding: var(--padding);
		gap: 0;
		background-color: var(--colors-base);
		border-radius: var(--quarter-padding);
		border: solid 1px var(--colors-low);
	}
</style>
