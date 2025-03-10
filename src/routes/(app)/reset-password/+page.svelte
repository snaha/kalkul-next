<script lang="ts">
	import Logo from '$lib/components/icons/logo.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { Checkmark, Close, WarningAltFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import adapter from '$lib/adapters'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import { resetPasswordFormSchema } from '$lib/schemas'
	import type { z, ZodFormattedError } from 'zod'

	let newPassword = $state('')
	let confirmNewPassword = $state('')
	let error = $state('')
	let formErrors: ZodFormattedError<z.infer<typeof resetPasswordFormSchema>> | undefined =
		$state(undefined)
	let formValid = $state(false)
	let passwordTouched = $state(false)
	let confirmPasswordTouched = $state(false)

	async function resetPassword(newPassword: string) {
		try {
			await adapter.resetPassword(newPassword)
			goto(routes.HOME)
		} catch (e) {
			error = (e as Error).message
		}
	}

	function onPasswordBlur() {
		if (newPassword?.trim() === '') {
			passwordTouched = false
		} else {
			passwordTouched = true
		}
	}

	function onConfirmPasswordBlur() {
		if (confirmNewPassword && confirmNewPassword !== newPassword) {
			confirmPasswordTouched = true
		} else {
			confirmPasswordTouched = false
		}
	}

	$effect(() => {
		const res = resetPasswordFormSchema.safeParse({ newPassword, confirmNewPassword })
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
	<a href={routes.HOME} class="logo"><Logo size={40} /></a>
	<div class="reset-password">
		<Typography variant="h4">{$_('resetPassword')}</Typography>
		<form>
			<Input
				type="password"
				label={$_('password')}
				bind:value={newPassword}
				onblur={onPasswordBlur}
				error={passwordTouched && newPassword.trim() !== '' && formErrors?.newPassword?._errors
					? newPasswordError
					: undefined}
			></Input>
			<Input
				type="password"
				label={$_('confirmPassword')}
				bind:value={confirmNewPassword}
				onblur={onConfirmPasswordBlur}
				error={confirmPasswordTouched &&
				confirmNewPassword.trim() !== '' &&
				formErrors?.confirmNewPassword?._errors
					? confirmNewPassError
					: undefined}
			></Input>
		</form>
		{#if error}
			<div class="error">
				<WarningAltFilled size={24} />
				{error}
			</div>
		{/if}
		<div class="buttons">
			<Button disabled={!formValid} dimension="compact" onclick={() => resetPassword(newPassword)}
				><Checkmark size={24} />{$_('resetPassword')}</Button
			>
			<Button variant="secondary" dimension="compact" onclick={() => goto(routes.HOME)}
				><Close size={24} />{$_('cancel')}</Button
			>
		</div>
	</div>
</main>

<style>
	main {
		display: flex;
		width: 100%;
		height: 100vh;
		align-items: center;
		justify-content: center;
		margin: var(--double-padding);
	}
	.logo {
		position: fixed;
		display: flex;
		top: var(--double-padding);
		left: var(--double-padding);
		color: var(--colors-ultra-high);
	}
	.reset-password {
		display: flex;
		flex-direction: column;
		gap: var(--double-padding);
		max-width: 560px;
		width: 100%;
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
