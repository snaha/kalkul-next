<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import { Checkmark, Close, WarningAltFilled } from 'carbon-icons-svelte'
	import adapter from '$lib/adapters'
	import routes from '$lib/routes'
	import { base } from '$app/paths'

	let newPassword = $state('')
	let newPasswordError: string | undefined = $state()
	let error: string | undefined = $state()
	let success = $state(false)
	const formValid = $derived(newPasswordError === undefined)

	async function updateUserPassword() {
		try {
			await adapter.resetPassword(newPassword)
			success = true
		} catch (e) {
			error = String(e)
			console.error(e)
		}
	}

	$effect(() => {
		if (newPassword.length < 12) {
			newPasswordError = $_('error.passwordLengthError')
		} else {
			newPasswordError = undefined
		}
	})
</script>

<main>
	{#if success}
		<img
			class="main-image"
			src={`${base}/images/hand-success.svg`}
			alt={$_('common.changePassword')}
		/>
		<Typography variant="h4" class="center-align"
			>{$_('page.changePassword.successChangePassword')}</Typography
		>
		<Button
			class="fit-content center-align"
			variant="strong"
			dimension="compact"
			href={routes.ACCOUNT}>{$_('page.changePassword.backToSettings')}</Button
		>
	{:else}
		<Typography variant="h4">{$_('page.changePassword.changePassword')}</Typography>
		<form onsubmit={updateUserPassword} class="change-email">
			<Input
				autofocus
				variant="solid"
				dimension="compact"
				type="password"
				label={$_('page.changePassword.newPassword')}
				bind:value={newPassword}
				error={newPasswordError}
			/>
		</form>
		{#if error}
			<div class="error">
				<WarningAltFilled size={24} />
				{error}
			</div>
		{/if}
		<div class="control-buttons">
			<Button dimension="compact" disabled={!formValid} onclick={updateUserPassword}
				><Checkmark size={24} />{$_('page.changePassword.changePassword')}</Button
			>
			<Button dimension="compact" variant="secondary" href={routes.ACCOUNT}
				><Close size={24} />{$_('common.cancel')}</Button
			>
		</div>
	{/if}
</main>

<style>
	:global(.center-align) {
		margin: 0 auto;
		text-align: center;
	}
	main {
		display: flex;
		flex-direction: column;
		flex: 1;
		justify-content: center;
		max-height: 100dvh;
		height: 100%;
		max-width: 560px;
		width: 100%;
		margin: 0 auto;
		gap: var(--double-padding);
	}
	.change-email {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}
	.control-buttons {
		display: flex;
		gap: var(--half-padding);
	}
	.main-image {
		margin: 0 auto;
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
