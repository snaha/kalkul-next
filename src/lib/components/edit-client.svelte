<script lang="ts">
	import adapter from '$lib/adapters'
	import { Close, Checkmark, Image, TrashCan } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import DateInput from '$lib/components/ui/input/date/input.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Avatar from '$lib/components/avatar.svelte'
	import type { ClientNoId, Client } from '$lib/types'
	import DeleteModal from './delete-modal.svelte'
	import ErrorComp from './error.svelte'
	import type { z, ZodFormattedError } from 'zod'
	import { emailFormSchema } from '$lib/schemas'
	import { notImplemented } from '$lib/not-implemented'
	import ContentLayout from './content-layout.svelte'
	import Vertical from './ui/vertical.svelte'

	type Props = {
		close: () => void
		hasClose?: boolean
		client?: Client
	}

	let { close, hasClose = false, client }: Props = $props()

	const date = new Date()
	let name = $state('')
	let birthDate: Date | undefined = $state()
	let imageURI: string | undefined = $state()
	let email = $state('')
	let formType: 'edit' | 'create' = $derived(client ? 'edit' : 'create')
	let showConfirmModal = $state(false)
	let error: string | undefined = $state()
	let emailError: ZodFormattedError<z.infer<typeof emailFormSchema>> | undefined = $state()
	let emailValid = $state(true)
	let emailTouched = $state(false)
	let createDisabled = $derived(name === '' || !birthDate || birthDate > date || !emailValid)

	$effect(() => {
		if (client) {
			name = client.name
			birthDate = new Date(client.birth_date)
			email = client.email
		}
	})

	async function create() {
		error = undefined
		if (!birthDate) {
			error = $_('error.birthDateUndefined')
			return
		}
		try {
			const client: ClientNoId = {
				name,
				birth_date: birthDate.toDateString(),
				email,
			}
			await adapter.addClient(client)
			name = ''
			birthDate = undefined
			imageURI = undefined
			close()
		} catch (e) {
			error = (e as Error).message
		}
	}

	function cancel(event: Event) {
		// FIXME: not sure why this is needed here, but it won't work without it
		event.preventDefault()
		close()
	}

	async function updateClient() {
		if (!client || !birthDate) {
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

	$effect(() => {
		if (email !== '') {
			const res = emailFormSchema.safeParse({ email })
			if (res.success) {
				emailError = undefined
				emailValid = true
				emailTouched = false
			} else {
				emailError = res.error.format()
				emailValid = false
			}
		}
	})
</script>

{#snippet birthDateError()}
	{$_('error.birthDateError')}
{/snippet}

{#snippet emailErrorSnippet()}
	{$_('error.emailError')}
{/snippet}

<ContentLayout>
	<Vertical>
		<section class="horizontal">
			{#if formType === 'create'}
				<Typography variant="h4">{$_('page.client.addClient')}</Typography>
			{:else}
				<Typography variant="h4">{$_('page.client.editClient')}</Typography>
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
			placeholder={$_('page.client.clientName')}
			label={$_('common.name')}
			bind:value={name}
		></Input>
		<DateInput
			variant="solid"
			dimension="compact"
			yearLabel={$_('common.year')}
			yearPlaceholder="1990"
			monthLabel={$_('common.month')}
			monthPlaceholder="01"
			dayLabel={$_('common.day')}
			dayPlaceholder="01"
			label={$_('common.birthDate')}
			bind:value={birthDate}
			error={birthDate && birthDate > date ? birthDateError : undefined}
			errorMessages={{
				invalidYear: $_('error.invalidYear'),
				invalidMonth: $_('error.invalidMonth'),
				invalidDay: $_('error.invalidDay'),
				invalidDate: $_('error.invalidDate'),
			}}
		></DateInput>
		<Input
			variant="solid"
			dimension="compact"
			placeholder={$_('common.emailOptional')}
			label={$_('common.email')}
			bind:value={email}
			error={emailTouched && email.trim() !== '' && emailError?.email?._errors
				? emailErrorSnippet
				: undefined}
			oninput={() => (emailTouched = true)}>{$_('page.client.clientEmailExplanation')}</Input
		>
		<section class="profile-picture">
			<Typography>{$_('page.client.profilePicture')}</Typography>
			<section class="horizontal">
				<Avatar
					{name}
					birthDate={birthDate ? new Date(birthDate) : new Date()}
					{imageURI}
					size={80}
				/>
				<section class="profile-helper">
					<Typography variant="small">{$_('page.client.profileImageHelper')}</Typography>
					<Button
						variant="solid"
						dimension="small"
						onclick={() => notImplemented(undefined, $_('common.comingSoon'))}
						><Image size={16} />{$_('page.client.uploadImage')}</Button
					>
				</section>
			</section>
		</section>
		{#if error}
			<ErrorComp>{error}</ErrorComp>
		{:else}
			<div class="spacer"></div>
		{/if}
		<section class="buttons horizontal">
			{#if formType === 'create'}
				<Button variant="strong" dimension="compact" onclick={create} disabled={createDisabled}
					><Checkmark size={24} />
					{$_('page.client.createClient')}
				</Button>
			{:else}
				<Button
					variant="strong"
					dimension="compact"
					onclick={updateClient}
					disabled={createDisabled}
					><Checkmark size={24} />
					{$_('common.done')}
				</Button>
			{/if}
			<Button variant="secondary" dimension="compact" onclick={cancel}
				><Close size={24} />{$_('common.cancel')}</Button
			>
			{#if formType === 'edit'}
				<div class="grower"></div>
				<Button variant="ghost" dimension="compact" onclick={confirmDeleteClient}
					><TrashCan size={24} />{$_('page.client.deleteClient')}</Button
				>
			{/if}
		</section>
	</Vertical>
</ContentLayout>

<DeleteModal
	confirm={deleteClient}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('page.client.clientDelete')}
	text={$_('page.client.clientDeleteExplanation')}
/>

<style>
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
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
		gap: var(--half-padding);
	}
	.spacer {
		margin-top: var(--half-padding);
	}
</style>
