<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import adapter from '$lib/adapters'
	import Typography from '$lib/components/ui/typography.svelte'
	import { z, type ZodFormattedError } from 'zod'
	import { emailFormSchema, loginFormSchema } from '$lib/schemas'
	import { Close, Checkmark, WarningAltFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Divider from './ui/divider.svelte'

	type User = z.infer<typeof loginFormSchema>
	type ResetPassword = z.infer<typeof emailFormSchema>

	interface Props {
		signIn: () => void
		register: () => void
		cancel: () => void
	}

	let { register, cancel, signIn }: Props = $props()
	let email = $state('')
	let password = $state('')
	let error = $state('')
	let loginFormErrors: ZodFormattedError<User> | undefined = $state(undefined)
	let resetPasswordError: ZodFormattedError<ResetPassword> | undefined = $state(undefined)
	let loginFormValid = $state(false)
	let resetPasswordFormValid = $state(false)
	let emailTouched = $state(false)
	let passwordTouched = $state(false)
	let forgotPassword = $state(false)
	let success: boolean = $state(false)
	const baseAddress =
		window.location.hostname === 'localhost'
			? 'http://localhost:64324'
			: window.location.hostname === '127.0.0.1'
				? 'http://127.0.0.1:64324'
				: ''

	async function resetPassword(email: string) {
		try {
			await adapter.sendResetPasswordLink(email)
			error = ''
			success = true
		} catch (e) {
			error = (e as Error).message
		}
	}

	function onEmailBlur() {
		if (email.trim() === '') {
			emailTouched = false
		} else {
			emailTouched = true
		}
	}

	function onPasswordBlur() {
		if (password.trim() === '') {
			passwordTouched = false
		} else {
			passwordTouched = true
		}
	}
	async function login() {
		try {
			await adapter.signIn(email, password)
			adapter.start()
			signIn()
			email = ''
			password = ''
		} catch (e) {
			error = (e as Error).message
		}
	}
	$effect(() => {
		const res = loginFormSchema.safeParse({ email, password })
		if (res.success) {
			loginFormErrors = undefined
			loginFormValid = true
		} else {
			loginFormErrors = res.error.format()
			loginFormValid = false
		}
	})
	$effect(() => {
		const res = emailFormSchema.safeParse({ email })
		if (res.success) {
			resetPasswordError = undefined
			resetPasswordFormValid = true
		} else {
			resetPasswordError = res.error.format()
			resetPasswordFormValid = false
		}
	})
</script>

{#snippet resetPassError()}
	{#if resetPasswordError?.email?._errors}
		{#each resetPasswordError?.email?._errors as error}
			{error}
		{/each}
	{/if}
{/snippet}

{#snippet emailError()}
	{#if loginFormErrors?.email?._errors}
		{#each loginFormErrors?.email?._errors as error}
			{error}
		{/each}
	{/if}
{/snippet}

{#snippet passwordError()}
	{#if loginFormErrors?.password?._errors}
		{#each loginFormErrors?.password?._errors as error}
			{error}
		{/each}
	{/if}
{/snippet}

<div class="logo">
	<a href="/" onclick={cancel}><img src="/logo.svg" alt="Logo" /></a>
</div>
{#if !forgotPassword}
	<div class="login">
		<Typography variant="h4">{$_('login')}</Typography>
		<form class="login-form" onsubmit={login}>
			<Input
				bind:value={email}
				label="Email"
				type="email"
				error={emailTouched && email.trim() !== '' && loginFormErrors?.email?._errors
					? emailError
					: undefined}
				onblur={onEmailBlur}
				oninput={() => (error = '')}
			></Input>
			<Input
				bind:value={password}
				type="password"
				label="Password"
				error={passwordTouched && password.trim() !== '' && loginFormErrors?.password?._errors
					? passwordError
					: undefined}
				onblur={onPasswordBlur}
				oninput={() => (error = '')}
			></Input>
			{#if error}
				<div class="error">
					<WarningAltFilled size={24} />
					{error}
				</div>
			{/if}
			<div class="controls">
				<div class="buttons">
					<Button type="submit" disabled={!loginFormValid} onclick={login}
						><Checkmark size={24} />{$_('login')}</Button
					>
					<Button variant="secondary" onclick={cancel}><Close size={24} /> {$_('cancel')}</Button>
				</div>
				<a href="/" onclick={() => (forgotPassword = true)}>{$_('forgotPassword')}</a>
			</div>
		</form>
		<Divider --margin="0" />
		<div class="register">
			<Typography>{$_('noAccount')}</Typography>
			<a href="/" onclick={register}>{$_('signUp')}</a>
		</div>
	</div>
{:else if !success}
	<div class="login">
		<div class="header">
			<Typography variant="h4">{$_('forgotPassword').replace('?', '')}</Typography>
			<Typography variant="large">{$_('forgotPasswordText')}</Typography>
		</div>
		<form class="email">
			<Input
				bind:value={email}
				label="Email"
				type="email"
				error={emailTouched && email.trim() !== '' && resetPasswordError?.email?._errors
					? resetPassError
					: undefined}
				onblur={onEmailBlur}
			></Input>
		</form>
		<div class="buttons">
			<Button disabled={!resetPasswordFormValid} onclick={() => resetPassword(email)}
				><Checkmark size={24} />{$_('resetLink')}</Button
			>
			<Button variant="secondary" onclick={cancel}><Close size={24} /> {$_('cancel')}</Button>
		</div>
		<Divider --margin="0" />
		<div class="register">
			<Typography
				>{$_('goBack')}<a
					href="/"
					onclick={() => {
						forgotPassword = false
						email = ''
						error = ''
					}}>{$_('login')}</a
				></Typography
			>
		</div>
	</div>
{:else}
	<div class="login success">
		<img src="/unboxed-cat.png" alt="cat" width="320px" />
		<div class="text">
			<Typography variant="h4">{$_('emailSent')}</Typography>
			<Typography variant="large">
				{#if window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('resetPasswordLocal', { values: { baseAddress, email } })}
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('resetPasswordRemote', { values: { email } })}
				{/if}
			</Typography>
		</div>
	</div>
{/if}

<style>
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
	.login {
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: 560px;
		gap: var(--double-padding);
		height: 100vh;
		margin: 0 auto;
	}
	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}
	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.buttons {
		display: flex;
		gap: var(--half-padding);
	}
	a {
		font-size: var(--font-size);
		line-height: var(--line-height);
		letter-spacing: var(--letter-spacing);
		font-family: var(--font-family-sans-serif);
		color: var(--colors-high);
	}
	.register {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
	.success {
		align-items: center;
	}
	.header {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
	.text {
		display: flex;
		flex-direction: column;
		text-align: center;
		gap: var(--half-padding);
	}
</style>
