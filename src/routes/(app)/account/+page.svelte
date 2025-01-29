<script lang="ts">
	import { browser } from '$app/environment'
	import adapters from '$lib/adapters'
	import Error from '$lib/components/error.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
	import Select from '$lib/components/ui/select/select.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import { Checkmark } from 'carbon-icons-svelte'
	import { locale, _, locales } from 'svelte-i18n'

	let error: string | undefined = $state()

	const languageName: Record<string, string> = {
		en: 'English',
		cs: 'Čeština',
	}

	locale.subscribe((newLocale) => {
		if (browser && newLocale) {
			error = undefined
			adapters.updateLanguage(newLocale).catch((error) => {
				error = $_('updateLanguageError')
				console.error('Failed to update language', error)
			})
		}
	})
</script>

<main>
	<Typography variant="h4">{$_('accountSettings')}</Typography>
	<div class="info">
		<div class="language">
			{#if $locale}
				<Select bind:value={$locale} label={$_('language')} dimension="compact">
					{#each $locales as locale}
						<Option value={locale}>{languageName[locale]}</Option>
					{/each}
				</Select>
				{#if error}
					<Error>{error}</Error>
				{/if}
			{/if}
		</div>
		<Input label={$_('emailAddress')} value={authStore.user?.email} disabled />
	</div>
	<div class="control-buttons">
		<Button dimension="compact" href="/account/change-email" variant="secondary"
			>{$_('changeEmailAddress')}</Button
		>
		<Button dimension="compact" href="/account/change-password" variant="secondary"
			>{$_('changePassword')}</Button
		>
	</div>
	<Button href="/" class="fit-content" dimension="compact"
		><Checkmark size={24} />{$_('done')}</Button
	>
</main>

<style>
	:global(.fit-content) {
		width: fit-content;
	}
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100vh;
		max-width: 560px;
		margin: 0 auto;
		gap: var(--double-padding);
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}
	.language {
		display: flex;
		flex-direction: column;
		gap: var(--quarter-padding);
	}
	.control-buttons {
		display: flex;
		gap: var(--half-padding);
	}
</style>
