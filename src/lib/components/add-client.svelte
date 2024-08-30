<script lang="ts">
	import { Close, Checkmark, Image } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from './button.svelte'
	import DateInput from './input/date-input.svelte'
	import Input from './input/input.svelte'
	import Typography from './typography.svelte'
	import Avatar from './avatar.svelte'
	import type { ClientNoId } from '$lib/types'

	type Props = {
		close: () => void
		createClient: (client: ClientNoId) => void
	}

	let { close, createClient }: Props = $props()

	const date = new Date().toDateString()
	let name = $state('')
	let birthDate = $state(date)
	let imageURI: string | undefined = $state()

	let createDisabled = $derived(name === '' || birthDate === date)

	function create() {
		const client: ClientNoId = {
			name,
			birth_date: birthDate,
		}
		name = ''
		birthDate = date
		imageURI = undefined
		createClient(client)
	}
</script>

<form class="vertical">
	<section class="horizontal">
		<Typography variant="h5">{$_('addClient')}</Typography>
		<div class="grower"></div>
		<Button variant="ghost" onclick={close}><Close size={24} /></Button>
	</section>
	<Input
		autofocus
		variant="solid"
		placeholder={$_('clientName')}
		label={$_('name')}
		bind:value={name}
	></Input>
	<DateInput
		variant="solid"
		placeholder={$_('datePlaceholder')}
		label={$_('birthDate')}
		bind:value={birthDate}
	></DateInput>
	<section class="profile-picture">
		<Typography>{$_('profilePicture')}</Typography>
		<section class="horizontal">
			<Avatar {name} birthDate={new Date(birthDate)} {imageURI} size={80} />
			<section class="profile-helper">
				<Typography variant="small">{$_('profileImageHelper')}</Typography>
				<Button variant="solid" dimension="small"><Image size={16} />{$_('uploadImage')}</Button>
			</section>
		</section>
	</section>
	<section class="buttons horizontal">
		<Button variant="strong" onclick={create} disabled={createDisabled}
			><Checkmark size={24} />{$_('createClient')}</Button
		>
		<Button variant="secondary" onclick={close}><Close size={24} />{$_('cancel')}</Button>
	</section>
</form>

<style>
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--padding);
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--padding);
	}
	.grower {
		flex: 1;
	}
	.profile-picture {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
	.profile-helper {
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		justify-content: flex-start;
		align-items: flex-start;
	}
	.buttons {
		margin-top: var(--padding);
		gap: var(--half-padding);
	}
</style>
