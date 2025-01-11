<script lang="ts">
	import { browser } from '$app/environment'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
	import Select from '$lib/components/ui/select/select.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { authStore } from '$lib/stores/auth.svelte'
	import { Checkmark } from 'carbon-icons-svelte'
	import { locale, locales, _ } from 'svelte-i18n'

	const languageName: Record<string, string> = {
		en: 'English',
		cs: 'Čeština',
	}

	$effect(() => {
		if ($locale && !$locales.includes($locale)) {
			$locale = $locale.split('-')[0]
			if (!$locales.includes($locale)) {
				$locale = $locales[0]
			}
		}
	})
	$effect(() => {
		if (browser && $locale) {
			localStorage.setItem('user-lang', $locale)
		}
	})
</script>

<main>
	<Typography variant="h4">{$_('accountSettings')}</Typography>
	<div class="info">
		{#if $locale}
			<Select bind:value={$locale} label={$_('language')} dimension="compact">
				{#each $locales as locale}
					<Option value={locale}>{languageName[locale]}</Option>
				{/each}
			</Select>
		{/if}
		<Input
			label={$_('emailAddress')}
			value={authStore.user?.new_email ?? authStore.user?.email}
			disabled
		/>
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
	.control-buttons {
		display: flex;
		gap: var(--half-padding);
	}
</style>
