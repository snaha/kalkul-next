<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import { ChatBot, Logout, Moon, SettingsEdit, UserAvatarFilled } from 'carbon-icons-svelte'
	import adapter from '$lib/adapters'
	import { authStore } from '$lib/stores/auth.svelte'
	let { children } = $props()

	function notImplemented() {
		alert('Not implemented!')
	}
</script>

<header>
	<a href="/">
		<img src="/logo.svg" alt="Logo" width="40" height="40" />
	</a>
	{#snippet trigger()}
		<UserAvatarFilled size={24} />{authStore.user?.email}
	{/snippet}
	<div class="user-info">
		<Dropdown {trigger} dimension="compact">
			<Button variant="ghost" dimension="compact" onclick={notImplemented} leftAlign>
				<SettingsEdit size={24} />
				Account settings
			</Button>
			<Button variant="ghost" dimension="compact" onclick={() => adapter.signOut()} leftAlign>
				<Logout size={24} />
				Logout
			</Button>
		</Dropdown>
		<Button dimension="compact" variant="ghost" onclick={notImplemented}
			><ChatBot size={24} /></Button
		>
		<Button dimension="compact" variant="ghost" onclick={notImplemented}><Moon size={24} /></Button>
	</div>
</header>
{#if children}
	{@render children()}
{/if}

<style>
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
</style>
