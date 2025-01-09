<script lang="ts">
	import Button from './ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { z, type ZodFormattedError } from 'zod'
	import Typography from '$lib/components/ui/typography.svelte'
	import adapter from '$lib/adapters'
	import { registerFormSchema } from '$lib/schemas'
	import Divider from './ui/divider.svelte'
	import { _ } from 'svelte-i18n'
	import { Close, Checkmark, WarningAltFilled } from 'carbon-icons-svelte'

	type User = z.infer<typeof registerFormSchema>

	interface Props {
		login: () => void
		cancel: () => void
	}

	let { login, cancel }: Props = $props()
	let formErrors: ZodFormattedError<User> | undefined = $state()
	let formValid = $state(false)
	let error = $state('')
	let success = $state(false)

	let user: Partial<User> = $state({})

	let emailTouched = $state(false)
	let passwordTouched = $state(false)
	let confirmPasswordTouched = $state(false)
	const baseAddress =
		window.location.hostname === 'localhost'
			? 'http://localhost:64324'
			: window.location.hostname === '127.0.0.1'
				? 'http://127.0.0.1:64324'
				: ''

	function onEmailBlur() {
		if (user.email?.trim() === '') {
			emailTouched = false
		} else {
			emailTouched = true
		}
	}

	function onPasswordBlur() {
		if (user.password?.trim() === '') {
			passwordTouched = false
		} else {
			passwordTouched = true
		}
	}

	function onConfirmPasswordBlur() {
		if (user.confirmPassword && user.confirmPassword !== user.password) {
			confirmPasswordTouched = true
		} else {
			confirmPasswordTouched = false
		}
	}

	async function register() {
		try {
			if (user.email && user.password) {
				await adapter.signUp(user.email, user.password)
				success = true
			}
		} catch (e) {
			error = (e as Error).message
		}
	}
	$effect(() => {
		const res = registerFormSchema.safeParse(user)
		if (res.success) {
			formErrors = undefined
			formValid = true
		} else {
			formErrors = res.error.format()
			formValid = false
		}
	})
</script>

{#snippet emailError()}
	{#if formErrors?.email?._errors}
		{#each formErrors?.email?._errors as error}
			{$_(error)}
		{/each}
	{/if}
{/snippet}

{#snippet passwordError()}
	{#if formErrors?.password?._errors}
		{#each formErrors?.password?._errors as error}
			{$_(error)}
		{/each}
	{/if}
{/snippet}

{#snippet confirmPasswordError()}
	{#if formErrors?.confirmPassword?._errors}
		{#each formErrors?.confirmPassword?._errors as error}
			{$_(error)}
		{/each}
	{/if}
{/snippet}

<div class="logo">
	<a href="/" onclick={cancel}><img src="/logo.svg" alt="Logo" /></a>
</div>
{#if !success}
	<div class="regitration">
		<Typography variant="h4">{$_('signUp')}</Typography>
		<form class="registration-form" onsubmit={register}>
			<Input
				bind:value={user.email}
				label="Email"
				error={emailTouched && user.email?.trim() !== '' && formErrors?.email?._errors
					? emailError
					: undefined}
				onblur={onEmailBlur}
			/>
			<Input
				bind:value={user.password}
				label={$_('password')}
				error={passwordTouched && user.password?.trim() !== '' && formErrors?.password?._errors
					? passwordError
					: undefined}
				type="password"
				onblur={onPasswordBlur}
			/>
			<Input
				bind:value={user.confirmPassword}
				label={$_('confirmPassword')}
				error={confirmPasswordTouched &&
				user.confirmPassword?.trim() !== '' &&
				formErrors?.confirmPassword?._errors
					? confirmPasswordError
					: undefined}
				type="password"
				onblur={onConfirmPasswordBlur}
			/>
			{#if error}
				<div class="error">
					<WarningAltFilled size={24} />
					{error}
				</div>
			{/if}
			<div class="buttons">
				<Button type="submit" disabled={!formValid} onclick={register}
					><Checkmark size={24} />{$_('createAccount')}</Button
				>
				<Button variant="secondary" onclick={cancel}><Close size={24} /> {$_('cancel')}</Button>
			</div>
		</form>
		<Divider --margin="0" />
		<div class="signin">
			<Typography>{$_('haveAccount')}</Typography>
			<a href="/" onclick={login}>{$_('login')}</a>
		</div>
	</div>
{:else}
	<div class="regitration success">
		<img src="/images/registration-link.svg" alt="Verification link sent" />
		<div class="text">
			<Typography variant="h4">{$_('checkEmail')}</Typography>
			<Typography variant="large">
				{#if window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('verificationLinkLocal', { values: { baseAddress, email: user.email } })}
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('verificationLinkRemote', { values: { email: user.email } })}
				{/if}</Typography
			>
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
	.regitration {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--double-padding);
		max-width: 560px;
		height: 100vh;
		margin: 0 auto;
	}
	.success {
		align-items: center;
	}
	.registration-form {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
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
	.signin {
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
	.text {
		display: flex;
		flex-direction: column;
		text-align: center;
		gap: var(--half-padding);
	}
</style>
