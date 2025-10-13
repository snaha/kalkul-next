<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import adapter from '$lib/adapters'
	import Typography from '$lib/components/ui/typography.svelte'
	import { emailFormSchema } from '$lib/schemas'
	import { WarningAltFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Divider from '$lib/components/ui/divider.svelte'
	import routes from '$lib/routes'
	import { authStore } from '$lib/stores/auth.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { base } from '$app/paths'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import ResponsiveLayout from '$lib/components/ui/responsive-layout.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'

	$effect(() => {
		if (authStore.isLoggedIn) {
			goto(routes.HOME)
		}
	})

	let email = $state('')
	let error = $state('')
	let resetPasswordError: string | undefined = $state()
	let success: boolean = $state(false)
	const mailpitUrl = `${page.url.protocol}//${page.url.hostname}:64324`

	async function resetPassword(email: string) {
		if (!validate()) {
			return
		}
		try {
			await adapter.sendResetPasswordLink(email)
			error = ''
			success = true
		} catch (e) {
			error = (e as Error).message
		}
	}

	function validate() {
		const res = emailFormSchema.safeParse({ email })
		if (res.success) {
			resetPasswordError = undefined
		} else {
			resetPasswordError = $_('error.emailError')
		}
		return res.success
	}
</script>

{#snippet resetPasswordErrorSnippet()}
	<Horizontal --horizontal-gap="var(--half-padding)">
		<WarningAltFilled size={24} />
		{resetPasswordError}
	</Horizontal>
{/snippet}

<Fullscreen>
	<Vertical class="max-width560" --vertical-gap="var(--double-padding)">
		{#if !success}
			<div class="header">
				<Typography variant="h4">{$_('page.forgotPassword.forgotPassword')}</Typography>
				<Typography>{$_('page.forgotPassword.forgotPasswordText')}</Typography>
			</div>
			<form class="email">
				<Input
					dimension="compact"
					variant="solid"
					bind:value={email}
					label={$_('page.forgotPassword.email')}
					type="email"
					error={resetPasswordError ? resetPasswordErrorSnippet : undefined}
				></Input>
			</form>
			{#if error}
				<div class="error">
					<WarningAltFilled size={24} />
					{error}
				</div>
			{/if}
			<ResponsiveLayout --responsive-justify-content="stretch">
				<Button dimension="compact" variant="strong" onclick={() => resetPassword(email)}
					>{$_('page.forgotPassword.resetLink')}</Button
				>
			</ResponsiveLayout>
			<Divider --margin="0" />
			<div class="register">
				<Typography
					>{$_('page.forgotPassword.goBack')}<a href={routes.LOGIN}
						>{$_('page.forgotPassword.login')}</a
					></Typography
				>
			</div>
		{:else}
			<Horizontal --horizontal-justify-content="center">
				<img
					src={`${base}/images/communication-spam.svg`}
					alt={$_('common.resetPasswordLink')}
					width="256"
				/>
			</Horizontal>
			<div class="text">
				<Typography variant="h4">{$_('page.forgotPassword.emailSent')}</Typography>
				<Typography>
					{#if page.url.hostname === 'localhost' || page.url.hostname === '127.0.0.1'}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html $_('page.forgotPassword.resetPasswordLocal', {
							values: {
								email: `<span class='green'>${email}</span>`,
								link: `<a href="${mailpitUrl}" target="_blank">Mailpit</a>`,
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
		{/if}
	</Vertical>
</Fullscreen>

<style>
	:global(.max-width560) {
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
	.register {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
