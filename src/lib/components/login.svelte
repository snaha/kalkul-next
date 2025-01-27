<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import adapter from '$lib/adapters'
	import Typography from '$lib/components/ui/typography.svelte'
	import { z, type ZodFormattedError } from 'zod'
	import { loginFormSchema } from '$lib/schemas'
	import { Close, Checkmark, WarningAltFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Divider from '$lib/components/ui/divider.svelte'
	import Logo from '$lib/components/icons/logo.svelte'
	import routes from '$lib/routes'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	type User = z.infer<typeof loginFormSchema>

	let email = $state('')
	let password = $state('')
	let error = $state('')
	let loginFormErrors: ZodFormattedError<User> | undefined = $state(undefined)
	let loginFormValid = $state(false)
	let emailTouched = $state(false)
	let passwordTouched = $state(false)

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
			if (!loginFormValid) return
			await adapter.signIn(email, password)
			email = ''
			password = ''
			if ($page.url.pathname === routes.LOGIN) {
				goto(routes.HOME)
			}
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
</script>

{#snippet emailError()}
	{#if loginFormErrors?.email?._errors}
		{#each loginFormErrors?.email?._errors as error}
			{$_(error)}
		{/each}
	{/if}
{/snippet}

{#snippet passwordError()}
	{#if loginFormErrors?.password?._errors}
		{#each loginFormErrors?.password?._errors as error}
			{$_(error)}
		{/each}
	{/if}
{/snippet}

<a href={routes.HOME} class="logo"><Logo size={40} /></a>
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
				<Button type="submit" disabled={!loginFormValid}
					><Checkmark size={24} />{$_('login')}</Button
				>
				<Button variant="secondary" href={routes.HOME}><Close size={24} /> {$_('cancel')}</Button>
			</div>
			<a href={routes.FORGOT_PASSWORD}>{$_('forgotPassword')}</a>
		</div>
	</form>
	<Divider --margin="0" />
	<div class="register">
		<Typography>{$_('noAccount')}</Typography>
		<a href={routes.SIGNUP}>{$_('signUp')}</a>
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
	.login {
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: 560px;
		gap: var(--double-padding);
		height: 100vh;
		margin: 0 auto;
		padding: var(--padding);
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
		gap: var(--half-padding);
		flex-wrap: wrap;
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
</style>
