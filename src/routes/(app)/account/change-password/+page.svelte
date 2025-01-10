<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import { updatePasswordFormSchema } from '$lib/schemas'
	import { z } from 'zod'
	import Input from '$lib/components/ui/input/input.svelte'
	import { _ } from 'svelte-i18n'
	import type { ZodFormattedError } from 'zod'
	import Button from '$lib/components/ui/button.svelte'
	import { Checkmark, Close, WarningAltFilled } from 'carbon-icons-svelte'
	import adapter from '$lib/adapters'
	import { authStore } from '$lib/stores/auth.svelte'

	type User = z.infer<typeof updatePasswordFormSchema>
	let formErrors: ZodFormattedError<User> | undefined = $state(undefined)
	let formValid = $state(false)

	let currentPasswordTouched = $state(false)
	let passwordTouched = $state(false)
	let confirmPasswordTouched = $state(false)

	let email = $derived(authStore.user?.new_email ?? authStore.user?.email ?? '')
	let currentPassword = $state('')
	let confirmNewPassword = $state('')
	let newPassword = $state('')

	let success = $state(false)
	let error: string | undefined = $state(undefined)

	async function updateUserPassword() {
		try {
			await adapter.signIn(email, currentPassword)
			await adapter.updatePassword(newPassword)
			success = true
		} catch (e) {
			console.error(e)
			error = (e as Error).message
			currentPassword = ''
		}
	}

	function onPasswordBlur() {
		if (newPassword.trim() === '') {
			passwordTouched = false
		} else {
			passwordTouched = true
		}
	}
	function onConfirmPasswordBlur() {
		if (confirmNewPassword.trim() === '') {
			confirmPasswordTouched = false
		} else {
			confirmPasswordTouched = true
		}
	}
	function onCurrentPasswordBlur() {
		if (currentPassword.trim() === '') {
			currentPasswordTouched = false
		} else {
			currentPasswordTouched = true
		}
	}

	$effect(() => {
		const res = updatePasswordFormSchema.safeParse({
			newPassword,
			confirmNewPassword,
			currentPassword,
		})
		if (res.success) {
			formErrors = undefined
			formValid = true
		} else {
			formErrors = res.error.format()
			formValid = false
		}
	})
	$inspect(success)
</script>

{#snippet newPasswordError()}
	{#if formErrors?.newPassword?._errors}
		{#each formErrors?.newPassword?._errors as error}
			{$_(error)}
		{/each}
	{/if}
{/snippet}
{#snippet confirmNewPassError()}
	{#if formErrors?.confirmNewPassword?._errors}
		{#each formErrors?.confirmNewPassword?._errors as error}
			{$_(error)}
		{/each}
	{/if}
{/snippet}
{#snippet currentPasswordError()}
	{#if formErrors?.currentPassword?._errors}
		{#each formErrors?.currentPassword?._errors as error}
			{$_(error)}
		{/each}
	{/if}
{/snippet}

<main>
	{#if success}
		<div class="logo">
			<a href="/"><img src="/logo.svg" alt="Logo" /></a>
		</div>
		<img class="main-image" src="/images/change-password.svg" alt="Change password" />
		<Typography variant="h4" class="center-align">{$_('successChangePassword')}</Typography>
		<Button class="fit-content center-align" variant="solid" dimension="compact" href="/account"
			>{$_('backToSettings')}</Button
		>
	{:else}
		<Typography variant="h4">{$_('changePassword')}</Typography>
		<form onsubmit={updateUserPassword} class="change-email">
			<Input
				type="password"
				label={$_('newPassword')}
				bind:value={newPassword}
				onblur={onPasswordBlur}
				error={passwordTouched && newPassword.trim() !== '' && formErrors?.newPassword?._errors
					? newPasswordError
					: undefined}
			/>
			<Input
				type="password"
				label={$_('confirmNewPassword')}
				bind:value={confirmNewPassword}
				onblur={onConfirmPasswordBlur}
				error={confirmPasswordTouched &&
				confirmNewPassword.trim() !== '' &&
				formErrors?.confirmNewPassword?._errors
					? confirmNewPassError
					: undefined}
			/>
			<Input
				type="password"
				label={$_('currentPassword')}
				bind:value={currentPassword}
				onblur={onCurrentPasswordBlur}
				error={currentPasswordTouched &&
				currentPassword.trim() !== '' &&
				formErrors?.currentPassword?._errors
					? currentPasswordError
					: undefined}
				oninput={() => (error = undefined)}
			>
				{$_('credentialsChangeHelperText')}
			</Input>
		</form>
		{#if error}
			<div class="error">
				<WarningAltFilled size={24} />
				{error}
			</div>
		{/if}
		<div class="control-buttons">
			<Button dimension="compact" disabled={!formValid} onclick={updateUserPassword}
				><Checkmark size={24} />{$_('changePassword')}</Button
			>
			<Button dimension="compact" variant="secondary" href="/account"
				><Close size={24} />{$_('cancel')}</Button
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
		justify-content: center;
		height: 100vh;
		max-width: 560px;
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
	.logo {
		position: fixed;
		top: var(--padding);
		left: var(--padding);
		width: 40px;
		height: 40px;
	}
	.logo img {
		width: 100%;
		height: 100%;
		object-fit: contain;
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
