<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import { resetPasswordFormSchema } from '$lib/schemas'
	import { z } from 'zod'
	import Input from '$lib/components/ui/input/input.svelte'
	import { _ } from 'svelte-i18n'
	import type { ZodFormattedError } from 'zod'
	import Button from '$lib/components/ui/button.svelte'
	import { Checkmark, Close, WarningAltFilled } from 'carbon-icons-svelte'
	import adapter from '$lib/adapters'
	import routes from '$lib/routes'
	import { base } from '$app/paths'

	let formErrors: ZodFormattedError<z.infer<typeof resetPasswordFormSchema>> | undefined =
		$state(undefined)
	let formValid = $state(false)

	let passwordTouched = $state(false)
	let confirmPasswordTouched = $state(false)

	let confirmNewPassword = $state('')
	let newPassword = $state('')

	let success = $state(false)
	let error: string | undefined = $state(undefined)

	async function updateUserPassword() {
		try {
			await adapter.resetPassword(newPassword)
			success = true
		} catch (e) {
			console.error(e)
			error = (e as Error).message
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

	function clearErrorState() {
		if (error) {
			error = undefined
			passwordTouched = false
			confirmPasswordTouched = false
		}
	}

	$effect(() => {
		const res = resetPasswordFormSchema.safeParse({
			newPassword,
			confirmNewPassword,
		})
		if (res.success) {
			formErrors = undefined
			formValid = true
		} else {
			formErrors = res.error.format()
			formValid = false
		}
	})
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

<main>
	{#if success}
		<img class="main-image" src={`${base}/images/hand-success.svg`} alt="Change password" />
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
				type="password"
				label={$_('page.changePassword.newPassword')}
				bind:value={newPassword}
				oninput={clearErrorState}
				onblur={onPasswordBlur}
				error={passwordTouched && newPassword.trim() !== '' && formErrors?.newPassword?._errors
					? newPasswordError
					: undefined}
			/>
			<Input
				type="password"
				label={$_('page.changePassword.confirmNewPassword')}
				bind:value={confirmNewPassword}
				oninput={clearErrorState}
				onblur={onConfirmPasswordBlur}
				error={confirmPasswordTouched &&
				confirmNewPassword.trim() !== '' &&
				formErrors?.confirmNewPassword?._errors
					? confirmNewPassError
					: undefined}
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
