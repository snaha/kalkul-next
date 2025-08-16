<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import { emailFormSchema } from '$lib/schemas'
	import { z } from 'zod'
	import Input from '$lib/components/ui/input/input.svelte'
	import { _ } from 'svelte-i18n'
	import type { ZodFormattedError } from 'zod'
	import Button from '$lib/components/ui/button.svelte'
	import { Checkmark, Close, WarningAltFilled } from 'carbon-icons-svelte'
	import adapter from '$lib/adapters'
	import routes from '$lib/routes'
	import { authStore } from '$lib/stores/auth.svelte'
	import { page } from '$app/state'
	import { base } from '$app/paths'

	let formErrors: ZodFormattedError<z.infer<typeof emailFormSchema>> | undefined = $state(undefined)
	let formValid = $state(false)

	let emailTouched = $state(false)

	let newEmail = $state('')

	let success = $state(false)
	let error: string | undefined = $state(undefined)

	const inbucketUrl = `${page.url.protocol}//${page.url.hostname}:64324`

	async function updateUserEmail() {
		try {
			await adapter.updateEmail(newEmail)
			success = true
		} catch (e) {
			console.error(e)
			error = (e as Error).message
		}
	}

	function onEmailBlur() {
		if (newEmail.trim() === '') {
			emailTouched = false
		} else {
			emailTouched = true
		}
	}
	function clearErrorState() {
		if (error) {
			error = undefined
			emailTouched = false
		}
	}
	$effect(() => {
		const res = emailFormSchema.safeParse({ email: newEmail })
		if (res.success) {
			if (newEmail === authStore.user?.email) {
				formErrors = {
					email: { _errors: [$_('error.emailAlreadyAssociated')] },
					_errors: [],
				}
				formValid = false
			} else {
				formErrors = undefined
				formValid = true
			}
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

<main>
	{#if success}
		<img class="main-image" src={`${base}/images/email-link.svg`} alt={$_('common.changeEmail')} />
		<div class="confirm-information">
			<Typography variant="h4">{$_('page.changeEmail.header')}</Typography>
			<Typography variant="large">
				{#if page.url.hostname === 'localhost' || page.url.hostname === '127.0.0.1'}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('page.changeEmail.bodyLocal', {
						values: {
							link: `<a class='green' href="${inbucketUrl}/m/${newEmail}" target="_blank">inbucket</a>`,
						},
					})}
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html $_('page.changeEmail.bodyRemote', {
						values: { newEmail: `<span class='green'>${newEmail}</span>` },
					})}
				{/if}
			</Typography>
			<Typography
				>{$_('page.changeEmail.footer')}
				{$_('page.changeEmail.checkSpam')}</Typography
			>
		</div>
	{:else}
		<Typography variant="h4">{$_('page.changeEmail.changeEmailAddress')}</Typography>
		<form onsubmit={updateUserEmail} class="change-email">
			<Input
				label={$_('page.changeEmail.newEmailAddress')}
				bind:value={newEmail}
				oninput={clearErrorState}
				onblur={onEmailBlur}
				error={emailTouched && newEmail.trim() !== '' && formErrors?.email?._errors
					? emailError
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
			<Button dimension="compact" disabled={!formValid} onclick={updateUserEmail}
				><Checkmark size={24} />{$_('page.changeEmail.changeEmail')}</Button
			>
			<Button dimension="compact" variant="secondary" href={routes.ACCOUNT}
				><Close size={24} />{$_('common.cancel')}</Button
			>
		</div>
	{/if}
</main>

<style>
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
	.confirm-information {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		text-align: center;
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
