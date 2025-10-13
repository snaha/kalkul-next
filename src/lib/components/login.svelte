<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import adapter from '$lib/adapters'
	import Typography from '$lib/components/ui/typography.svelte'
	import { z, type ZodFormattedError } from 'zod'
	import { loginFormSchema } from '$lib/schemas'
	import { Checkmark, WarningAltFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Divider from '$lib/components/ui/divider.svelte'
	import routes from '$lib/routes'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import Horizontal from './ui/horizontal.svelte'
	import Vertical from './ui/vertical.svelte'
	import ResponsiveLayout from './ui/responsive-layout.svelte'
	import Fullscreen from './fullscreen.svelte'
	import PasswordInput from './ui/input/password-input.svelte'

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
			if (page.url.pathname === routes.LOGIN) {
				goto(routes.HOME)
			}
		} catch (e) {
			error = (e as Error).message
		}
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			login()
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

<Fullscreen>
	<Vertical class="login" --vertical-gap="var(--double-padding)">
		<Typography variant="h4">{$_('common.login')}</Typography>
		<Vertical --vertical-gap="var(--padding)">
			<Input
				variant="solid"
				dimension="compact"
				bind:value={email}
				label={$_('common.email')}
				type="email"
				error={emailTouched && email.trim() !== '' && loginFormErrors?.email?._errors
					? emailError
					: undefined}
				onblur={onEmailBlur}
				oninput={() => (error = '')}
				onkeydown={onKeyDown}
			></Input>
			<PasswordInput
				variant="solid"
				dimension="compact"
				bind:value={password}
				label={$_('common.password')}
				error={passwordTouched && password.trim() !== '' && loginFormErrors?.password?._errors
					? passwordError
					: undefined}
				onblur={onPasswordBlur}
				oninput={() => (error = '')}
				onkeydown={onKeyDown}
			></PasswordInput>
			{#if error}
				<div class="error">
					<WarningAltFilled size={24} />
					{error}
				</div>
			{/if}
		</Vertical>
		<Vertical --vertical-gap="var(--padding)">
			<ResponsiveLayout --responsive-gap="var(--padding)" --responsive-justify-content="stretch">
				<Button variant="strong" dimension="compact" disabled={!loginFormValid} onclick={login}
					><Checkmark size={24} />{$_('common.login')}</Button
				>
			</ResponsiveLayout>
			<ResponsiveLayout --responsive-justify-content="stretch">
				<Horizontal --horizontal-justify-content="center">
					<a href={routes.FORGOT_PASSWORD}>{$_('component.login.forgotPassword')}</a>
				</Horizontal>
			</ResponsiveLayout>
		</Vertical>
		<Divider --margin="0" />
		<ResponsiveLayout --responsive-justify-content="stretch">
			<Horizontal --horizontal-justify-content="center">
				<Typography
					>{$_('component.login.noAccount')}
					<a href={routes.SIGNUP}>{$_('component.login.signUp')}</a></Typography
				>
			</Horizontal>
		</ResponsiveLayout>
	</Vertical>
</Fullscreen>

<style>
	:global(.width-100) {
		max-width: 100%;
		width: 100%;
	}
	:global(.login) {
		max-width: 560px;
		width: 100%;
	}
	a {
		font-size: var(--font-size);
		line-height: var(--line-height);
		letter-spacing: var(--letter-spacing);
		font-family: var(--font-family-sans-serif);
		color: var(--colors-high);
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
