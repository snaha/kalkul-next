<script lang="ts">
	import { Checkmark, WarningAltFilled } from 'carbon-icons-svelte'
	import Button from './ui/button.svelte'
	import Input from './ui/input/input.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import adapter from '$lib/adapters'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import Logo from './icons/logo.svelte'

	let password = $state('')
	let confirmPassword = $state('')
	let error = $state('')

	async function updatePassword(newPassword: string) {
		try {
			await adapter.updatePassword(newPassword)
			goto(routes.HOME)
		} catch (e) {
			error = (e as Error).message
		}
	}
</script>

<div class="logo"><Logo size={40} /></div>
<div class="update-password">
	<Typography variant="h4">{$_('updatePassword')}</Typography>
	<form>
		<Input type="password" label="Password" bind:value={password}></Input>
		<Input type="password" label="Confirm password" bind:value={confirmPassword}></Input>
	</form>
	{#if error}
		<div class="error">
			<WarningAltFilled size={24} />
			{error}
		</div>
	{/if}
	<div class="buttons">
		<Button onclick={() => updatePassword(password)}
			><Checkmark size={24} />{$_('updatePassword')}</Button
		>
	</div>
</div>

<style>
	.logo {
		position: fixed;
		display: flex;
		top: var(--double-padding);
		left: var(--double-padding);
		color: var(--colors-ultra-high);
	}
	.update-password {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--double-padding);
		max-width: 560px;
		height: 100vh;
		margin: 0 auto;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
	.buttons {
		display: flex;
		gap: var(--half-padding);
	}
	.error {
		display: inline-flex;
		align-items: center;
		gap: var(--half-padding);
		border: 1px solid var(--colors-top);
		border-radius: var(--border-radius);
		background: var(--colors-top);
		padding: var(--quarter-padding) var(--half-padding);
		color: var(--colors-base);
		font-family: var(--font-family-sans-serif);
		font-size: var(--font-size);
		line-height: var(--line-height);
		letter-spacing: var(--letter-spacing);
	}
</style>
