<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { z, type ZodFormattedError } from 'zod'
	import Typography from '$lib/components/ui/typography.svelte'
	import adapter from '$lib/adapters'
	import { emailFormSchema } from '$lib/schemas'
	import Divider from '$lib/components/ui/divider.svelte'
	import { _ } from 'svelte-i18n'
	import { Checkmark, WarningAltFilled } from 'carbon-icons-svelte'
	import Logo from '$lib/components/icons/logo.svelte'
	import routes, { apiRoutes } from '$lib/routes'
	import { authStore } from '$lib/stores/auth.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { locale } from 'svelte-i18n'
	import { base } from '$app/paths'
	import FlexItem from '$lib/components/ui/flex-item.svelte'
	import Checkbox from '$lib/components/ui/checkbox.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import ResponsiveLayout from '$lib/components/ui/responsive-layout.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'

	$effect(() => {
		if (authStore.isLoggedIn) {
			goto(routes.HOME)
		}
	})

	type User = z.infer<typeof emailFormSchema>

	let formErrors: ZodFormattedError<User> | undefined = $state()
	let passwordError: string | undefined = $state($_('error.passwordLengthError'))
	let password = $state('')
	let formValid = $derived(formErrors === undefined && passwordError === undefined)
	let error = $state('')
	let success = $state(false)
	let newsletterConsent = $state(false)

	let user: Partial<User> = $state({})

	let emailTouched = $state(false)
	const inbucketUrl = `${page.url.protocol}//${page.url.hostname}:64324`

	function onEmailBlur() {
		if (user.email?.trim() === '') {
			emailTouched = false
		} else {
			emailTouched = true
		}
	}

	async function register() {
		try {
			if (user.email && $locale) {
				await adapter.signUp(user.email, password, $locale.split('-')[0], newsletterConsent)
				success = true
			}
		} catch (e) {
			error = (e as Error).message
		}

		// Subscribe to newsletter if consent is given
		try {
			if (newsletterConsent && user.email) {
				const res = await fetch(apiRoutes.NEWSLETTER_SUBSCRIBE, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email: user.email }),
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
	$effect(() => {
		const res = emailFormSchema.safeParse(user)
		if (res.success) {
			formErrors = undefined
		} else {
			formErrors = res.error.format()
		}

		if (password.length < 12) {
			passwordError = $_('error.passwordLengthError')
		} else {
			passwordError = undefined
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

<ContentLayout --content-layout-margin="0">
	<Horizontal --horizontal-justify-content="space-between" class="width-100">
		<a href={routes.HOME} class="logo"><Logo size={40} /></a>
		<FlexItem></FlexItem>
	</Horizontal>
</ContentLayout>
{#if !success}
	<ContentLayout --content-layout-margin="0">
		<Vertical class="registration" --vertical-gap="var(--double-padding)">
			<Typography variant="h4">{$_('page.signUp.signUp')}</Typography>
			<Vertical --vertical-gap="var(--padding)">
				<Input
					variant="solid"
					dimension="compact"
					bind:value={user.email}
					label={$_('common.email')}
					error={emailTouched && user.email?.trim() !== '' && formErrors?.email?._errors
						? emailError
						: undefined}
					type="email"
					onblur={onEmailBlur}
				/>
				<Input
					variant="solid"
					dimension="compact"
					bind:value={password}
					label={$_('common.password')}
					error={passwordError}
					type="password"
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
					<ResponsiveLayout --responsive-gap="var(--padding)" --responsive-justify-content="start">
						<Button
							variant="strong"
							dimension="compact"
							type="submit"
							disabled={!formValid}
							onclick={register}><Checkmark size={24} />{$_('page.signUp.createAccount')}</Button
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
	</ContentLayout>
{:else}
	<ContentLayout>
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
								email: `<a class='green' href="${inbucketUrl}/m/${user.email}" target="_blank">inbucket</a>`,
							},
						})}
					{:else}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html $_('page.signUp.verificationLinkRemote', {
							values: { email: `<span class='green'>${user.email}</span>` },
						})}
					{/if}</Typography
				>
				<Typography>{$_('page.signUp.checkSpam')}</Typography>
			</Vertical>
		</Vertical>
	</ContentLayout>
{/if}

<style>
	.logo {
		color: var(--colors-ultra-high);
		height: 40px;
	}
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
	:global(.center) {
		text-align: center;
	}
</style>
