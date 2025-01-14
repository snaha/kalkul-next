<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Logo from '$lib/components/icons/logo.svelte'
	import { ChatBot, Logout, Moon, SettingsEdit, UserAvatarFilled } from 'carbon-icons-svelte'
	import adapter from '$lib/adapters'
	import Dropdown from '$lib/components/ui/dropdown.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import routes from '$lib/routes'
	import { _ } from 'svelte-i18n'
	import FeedbackModal from './feedback-modal.svelte'

	let showFeedbackModal = $state(false)

	async function logout() {
		await adapter.signOut()
		window.location.href = routes.HOME
	}

	function notImplemented() {
		alert('Not implemented!')
	}
</script>

<header>
	<a class="logo-link" href="/">
		<Logo size={32} />
	</a>
	<div class="user-info">
		<Dropdown buttonDimension="small" mode="dark">
			{#snippet button()}
				<UserAvatarFilled size={16} />{authStore.user?.new_email ?? authStore.user?.email}
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
		<Button mode="dark" dimension="small" variant="ghost" onclick={() => (showFeedbackModal = true)}
			><ChatBot size={16} /></Button
		>
		<Button mode="dark" dimension="small" variant="ghost" onclick={notImplemented}
			><Moon size={16} /></Button
		>
	</div>
</header>
<FeedbackModal
	bind:open={showFeedbackModal}
	oncancel={() => (showFeedbackModal = false)}
	confirm={notImplemented}
/>

<style lang="postcss">
	header {
		padding: var(--half-padding);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--colors-dark-ultra-low);
		color: var(--colors-dark-ultra-high);
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
