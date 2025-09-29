<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { z } from 'zod'
	import Typography from '$lib/components/ui/typography.svelte'
	import adapter from '$lib/adapters'
	import Divider from '$lib/components/ui/divider.svelte'
	import { _ } from 'svelte-i18n'
	import { WarningAltFilled } from 'carbon-icons-svelte'
	import routes, { apiRoutes } from '$lib/routes'
	import { authStore } from '$lib/stores/auth.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { locale } from 'svelte-i18n'
	import { base } from '$app/paths'
	import Checkbox from '$lib/components/ui/checkbox.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import ResponsiveLayout from '$lib/components/ui/responsive-layout.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import PasswordInput from '$lib/components/ui/input/password-input.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import type { AuthError } from '@supabase/supabase-js'

	$effect(() => {
		if (authStore.isLoggedIn) {
			goto(routes.HOME)
		}
	})

	let email = $state('')
	let emailError: string | undefined = $state()
	let password = $state('')
	let passwordError: string | undefined = $state()
	let error = $state('')
	let success = $state(false)
	let newsletterConsent = $state(false)

	const inbucketUrl = `${page.url.protocol}//${page.url.hostname}:64324`

	function isEmailValid() {
		return z.string().email().safeParse(email).success
	}

	function validateEmail() {
		if (isEmailValid()) {
			emailError = undefined
		} else {
			emailError = $_('error.pleaseEnterValidEmail')
		}
	}

	function onEmailFocus() {
		emailError = undefined
	}

	function isPasswordValid() {
		return password.length >= 12
	}

	function validatePassword() {
		if (isPasswordValid()) {
			passwordError = undefined
		} else {
			passwordError = $_('error.passwordLengthError')
		}
	}

	function onPasswordFocus() {
		passwordError = undefined
	}

	function validate() {
		validateEmail()
		validatePassword()
		return emailError === undefined && passwordError === undefined
	}

	async function register() {
		if (!validate()) {
			return
		}
		try {
			if (email && $locale) {
				await adapter.signUp(email, password, $locale.split('-')[0], newsletterConsent)
				success = true
			}
		} catch (e) {
			const errorCode = (e as AuthError)?.code
			if (errorCode === 'user_already_exists') {
				error = $_('error.userAlreadyRegistered')
			} else {
				error = (e as Error).message
			}
		}

		// Subscribe to newsletter if consent is given
		try {
			if (newsletterConsent && email) {
				const res = await fetch(apiRoutes.NEWSLETTER_SUBSCRIBE, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email }),
				})

				const data = await res.json()

				if (!res.ok) {
					console.error(data?.error || 'Something went wrong.')
				}
			}
		} catch (e) {
			console.error('Error subscribing to newsletter:', e)
		}
	}
</script>

{#snippet emailErrorSnippet()}
	<Horizontal --horizontal-gap="var(--half-padding)">
		<WarningAltFilled size={24} />
		{emailError}
	</Horizontal>
{/snippet}

{#snippet passwordErrorSnippet()}
	<Horizontal --horizontal-gap="var(--half-padding)">
		<WarningAltFilled size={24} />
		{passwordError}
	</Horizontal>
{/snippet}

<Fullscreen hasCloseButton={true} beta={true}>
	{#if !success}
		<Vertical class="registration" --vertical-gap="var(--double-padding)">
			<Typography variant="h4">{$_('page.signUp.signUp')}</Typography>
			<Vertical --vertical-gap="var(--padding)">
				<Input
					autofocus
					variant="solid"
					dimension="compact"
					bind:value={email}
					label={$_('common.email')}
					error={emailError ? emailErrorSnippet : undefined}
					type="email"
					onfocus={onEmailFocus}
				/>
				<PasswordInput
					variant="solid"
					dimension="compact"
					bind:value={password}
					label={$_('common.password')}
					error={passwordError ? passwordErrorSnippet : undefined}
					onfocus={onPasswordFocus}
					helperText={passwordError ? undefined : $_('error.passwordMinimumLength')}
				/>
				<Checkbox bind:checked={newsletterConsent}>
					{$_('page.signUp.subscribeToNewsletter')}</Checkbox
				>
				{#if error}
					<div class="error">
						<WarningAltFilled size={24} />
						{error}
					</div>
				{/if}
				<Vertical --vertical-gap="var(--padding)">
					<ResponsiveLayout
						--responsive-gap="var(--padding)"
						--responsive-justify-content="stretch"
					>
						<Button variant="strong" dimension="compact" type="submit" onclick={register}
							>{$_('page.signUp.createAccount')}</Button
						>
					</ResponsiveLayout>
					{#key $locale}
						<Typography variant="small"
							><!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html $_('page.signUp.agreeToTerms', {
								values: {
									terms: `<a href="${routes.TERMS}">${$_('page.signUp.terms')}</a>`,
									privacy: `<a href="${routes.PRIVACY}">${$_('page.signUp.privacy')}</a>`,
								},
							})}
						</Typography>
					{/key}
				</Vertical>
			</Vertical>
			<Divider --margin="0" />
			<ResponsiveLayout --responsive-justify-content="stretch">
				<Horizontal --horizontal-justify-content="center">
					<Typography
						>{$_('page.signUp.alreadyHaveAccount')}
						<a href={routes.LOGIN}>{$_('common.login')}</a></Typography
					>
				</Horizontal>
			</ResponsiveLayout>
		</Vertical>
	{:else}
		<Vertical
			class="registration"
			--vertical-gap="var(--double-padding)"
			--vertical-align-items="center"
		>
			<img
				src={`${base}/images/email-link.svg`}
				alt={$_('common.verificationLinkSent')}
				class="image"
			/>
			<Vertical --vertical-gap="var(--half-padding)" --vertical-align-items="center" class="center">
				<Typography variant="h4">{$_('page.signUp.checkEmail')}</Typography>
				<Typography variant="large">
					{#if page.url.hostname === 'localhost' || page.url.hostname === '127.0.0.1'}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html $_('page.signUp.verificationLinkLocal', {
							values: {
								email: `<a class='green' href="${inbucketUrl}/m/${email}" target="_blank">inbucket</a>`,
							},
						})}
					{:else}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html $_('page.signUp.verificationLinkRemote', {
							values: { email: `<span class='green'>${email}</span>` },
						})}
					{/if}</Typography
				>
				<Typography>{$_('page.signUp.checkSpam')}</Typography>
			</Vertical>
		</Vertical>
	{/if}
</Fullscreen>

<style>
	:global(.registration) {
		max-width: 560px;
		width: 100%;
	}
	:global(.width-100) {
		max-width: 100%;
		width: 100%;
	}
	.image {
		width: 256px;
		height: 256px;
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
		border-radius: var(--border-radius);
		background: var(--colors-red);
		padding: var(--half-padding);
		color: var(--colors-base);
		font-family: var(--font-family-sans-serif);
		font-size: var(--font-size);
		line-height: var(--line-height);
		letter-spacing: var(--letter-spacing);
	}
	:global(.center) {
		text-align: center;
	}
</style>
