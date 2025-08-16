<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import adapter from '$lib/adapters'
	import Typography from '$lib/components/ui/typography.svelte'
	import { z, type ZodFormattedError } from 'zod'
	import { emailFormSchema } from '$lib/schemas'
	import { Close, Checkmark, WarningAltFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Divider from '$lib/components/ui/divider.svelte'
	import Logo from '$lib/components/icons/logo.svelte'
	import routes from '$lib/routes'
	import { authStore } from '$lib/stores/auth.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { base } from '$app/paths'

	$effect(() => {
		if (authStore.isLoggedIn) {
			goto(routes.HOME)
		}
	})

	type ResetPassword = z.infer<typeof emailFormSchema>

	let email = $state('')
	let error = $state('')
	let resetPasswordError: ZodFormattedError<ResetPassword> | undefined = $state(undefined)
	let resetPasswordFormValid = $state(false)
	let emailTouched = $state(false)
	let success: boolean = $state(false)
	const inbucketUrl = `${page.url.protocol}//${page.url.hostname}:64324`

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
			{$_(error)}
		{/each}
	{/if}
{/snippet}

<a href={routes.HOME} class="logo"><Logo size={40} /></a>
{#if !success}
	<div class="login">
		<div class="header">
			<Typography variant="h4">{$_('page.forgotPassword.forgotPassword')}</Typography>
			<Typography variant="large">{$_('page.forgotPassword.forgotPasswordText')}</Typography>
		</div>
		<form class="email">
			<Input
				bind:value={email}
				label={$_('page.forgotPassword.email')}
				type="email"
				error={emailTouched && email.trim() !== '' && resetPasswordError?.email?._errors
					? resetPassError
					: undefined}
				onblur={onEmailBlur}
			></Input>
		</form>
		{#if error}
			<div class="error">
				<WarningAltFilled size={24} />
				{error}
			</div>
		{/if}
		<div class="buttons">
			<Button disabled={!resetPasswordFormValid} onclick={() => resetPassword(email)}
				><Checkmark size={24} />{$_('page.forgotPassword.resetLink')}</Button
			>
			<Button variant="secondary" onclick={() => history.back()}
				><Close size={24} /> {$_('page.forgotPassword.cancel')}</Button
			>
		</div>
		<Divider --margin="0" />
		<div class="register">
			<Typography
				>{$_('page.forgotPassword.goBack')}<a href={routes.LOGIN}
					>{$_('page.forgotPassword.login')}</a
				></Typography
			>
		</div>
	</div>
{:else}
	<div class="login success">
		<img src={`${base}/images/reset-password-link.svg`} alt={$_('common.resetPasswordLink')} />
		<div class="text">
			<Typography variant="h4">{$_('page.forgotPassword.emailSent')}</Typography>
			<Typography variant="large">
				{#if page.url.hostname === 'localhost' || page.url.hostname === '127.0.0.1'}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('page.forgotPassword.resetPasswordLocal', {
						values: {
							email: `<span class='green'>${email}</span>`,
							link: `<a href="${inbucketUrl}/m/${email}" target="_blank">inbucket</a>`,
						},
					})}
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('page.forgotPassword.resetPasswordRemote', {
						values: { email: `<span class='green'>${email}</span>` },
					})}
				{/if}
			</Typography>
			<Typography>{$_('page.forgotPassword.checkSpam')}</Typography>
		</div>
	</div>
{/if}

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
