<script lang="ts">
	import adapter from '$lib/adapters'
	import { Close, Checkmark, Image, TrashCan } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import DateInput from '$lib/components/ui/input/date-input.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Avatar from '$lib/components/avatar.svelte'
	import type { Client, ClientNoId } from '$lib/types'
	import DeleteModal from './delete-modal.svelte'

	type Props = {
		close: () => void
		hasClose?: boolean
		client?: Client
	}

	let { close, hasClose = false, client }: Props = $props()

	const date = new Date()
	let name = $state('')
	let birthDate = $state(date)
	let imageURI: string | undefined = $state()

	let createDisabled = $derived(name === '' || birthDate === date)
	let formType: 'edit' | 'create' = $derived(client ? 'edit' : 'create')
	let showConfirmModal = $state(false)

	$effect(() => {
		if (client) {
			name = client.name
			birthDate = new Date(client.birth_date)
		}
	})

	async function create() {
		const client: ClientNoId = {
			name,
			birth_date: birthDate.toDateString(),
		}
		name = ''
		birthDate = date
		imageURI = undefined
		await adapter.addClient(client)
		close()
	}

	function cancel(event: Event) {
		// FIXME: not sure why this is needed here, but it won't work without it
		event.preventDefault()
		close()
	}

	async function updateClient() {
		if (!client) {
			return
		}

		await adapter.updateClient({
			id: client.id,
			name,
			birth_date: birthDate.toDateString(),
		})
		close()
	}

	async function deleteClient() {
		if (!client) {
			return
		}
		showConfirmModal = false
		await adapter.deleteClient(client)
		close()
	}

	function confirmDeleteClient() {
		showConfirmModal = true
	}
</script>

<form class="vertical">
	<section class="horizontal">
		{#if formType === 'create'}
			<Typography variant="h4">{$_('addClient')}</Typography>
		{:else}
			<Typography variant="h4">{$_('Edit client')}</Typography>
		{/if}
		<div class="grower"></div>
		{#if hasClose}
			<Button variant="ghost" onclick={close}><Close size={24} /></Button>
		{/if}
	</section>
	<div class="spacer"></div>
	<Input
		autofocus
		variant="solid"
		dimension="compact"
		placeholder={$_('clientName')}
		label={$_('name')}
		bind:value={name}
	></Input>
	<DateInput
		variant="solid"
		dimension="compact"
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
	<div class="spacer"></div>
	<section class="buttons horizontal">
		{#if formType === 'create'}
			<Button variant="strong" dimension="compact" onclick={create} disabled={createDisabled}
				><Checkmark size={24} />
				{$_('createClient')}
			</Button>
		{:else}
			<Button variant="strong" dimension="compact" onclick={updateClient} disabled={createDisabled}
				><Checkmark size={24} />
				{$_('Done')}
			</Button>
		{/if}
		<Button variant="secondary" dimension="compact" onclick={cancel}
			><Close size={24} />{$_('cancel')}</Button
		>
		{#if formType === 'edit'}
			<div class="grower"></div>
			<Button variant="ghost" dimension="compact" onclick={confirmDeleteClient}
				><TrashCan size={24} />{$_('Delete client')}</Button
			>
		{/if}
	</section>
</form>

<DeleteModal
	confirm={deleteClient}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('Delete client?')}
	text={$_(
		'This client and all the portfolios it contains will be deleted permanently. There’s no undo.',
	)}
/>

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
	.spacer {
		margin-top: var(--half-padding);
	}
</style>
