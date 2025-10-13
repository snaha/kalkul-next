<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { WarningAltFilled } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import adapter from '$lib/adapters'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import { PASSWORD_MIN_LENGTH } from '$lib/schemas'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import PasswordInput from '$lib/components/ui/input/password-input.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'

	let newPassword = $state('')
	let error = $state('')
	let passwordError: string | undefined = $state()

	async function resetPassword(newPassword: string) {
		if (!validate()) {
			return
		}
		try {
			await adapter.resetPassword(newPassword)
			goto(routes.HOME)
		} catch (e) {
			error = (e as Error).message
		}
	}

	function isPasswordValid() {
		return newPassword.length >= PASSWORD_MIN_LENGTH
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
		validatePassword()
		return passwordError === undefined
	}
</script>

{#snippet passwordErrorSnippet()}
	<Horizontal --horizontal-gap="var(--half-padding)">
		<WarningAltFilled size={24} />
		{passwordError}
	</Horizontal>
{/snippet}

<Fullscreen>
	<Vertical class="max-width560" --vertical-gap="var(--double-padding)">
		<Typography variant="h4">{$_('page.resetPassword.resetPassword')}</Typography>
		<form>
			<PasswordInput
				dimension="compact"
				variant="solid"
				label={$_('page.resetPassword.password')}
				bind:value={newPassword}
				onfocus={onPasswordFocus}
				error={passwordError ? passwordErrorSnippet : undefined}
				helperText={passwordError ? undefined : $_('error.passwordMinimumLength')}
			></PasswordInput>
		</form>
		{#if error}
			<div class="error">
				<WarningAltFilled size={24} />
				{error}
			</div>
		{/if}
		<div class="buttons">
			<Button dimension="compact" onclick={() => resetPassword(newPassword)}
				>{$_('page.resetPassword.resetPasswordButton')}</Button
			>
		</div>
	</Vertical>
</Fullscreen>

<style>
	:global(.max-width560) {
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
