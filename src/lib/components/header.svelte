<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import { ChatBot, Logout, Moon, SettingsEdit, UserAvatarFilled } from 'carbon-icons-svelte'
	import adapter from '$lib/adapters'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import routes from '$lib/routes'
	import { _ } from 'svelte-i18n'

	async function logout() {
		await adapter.signOut()
		window.location.href = routes.HOME
	}

	function notImplemented() {
		alert('Not implemented!')
	}
</script>

<header>
	<a href="/">
		<img src="/logo.svg" alt="Logo" width="40" height="40" />
	</a>
	<div class="user-info">
		<Dropdown buttonDimension="compact">
			{#snippet button()}
				<UserAvatarFilled size={24} />{authStore.user?.new_email ?? authStore.user?.email}
			{/snippet}
			<ul class="dropdown-menu">
				<Button variant="ghost" dimension="compact" href={routes.ACCOUNT} leftAlign>
					<SettingsEdit size={24} />
					{$_('accountSettings')}
				</Button>
				<Button variant="ghost" dimension="compact" onclick={logout} leftAlign>
					<Logout size={24} />
					{$_('logout')}
				</Button>
			</ul>
		</Dropdown>
		<Button dimension="compact" variant="ghost" onclick={notImplemented}
			><ChatBot size={24} /></Button
		>
		<Button dimension="compact" variant="ghost" onclick={notImplemented}><Moon size={24} /></Button>
	</div>
</header>

<style lang="postcss">
	header {
		padding: var(--padding);
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--colors-low);
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
