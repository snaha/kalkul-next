<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte'
  import { Close } from 'carbon-icons-svelte'
  import { _ } from 'svelte-i18n'
  import Button from '$lib/components/ui/button.svelte'
  import LocalizedDateInput from '$lib/components/localized-date-input.svelte'
  import Input from '$lib/components/ui/input/input.svelte'
  import Typography from '$lib/components/ui/typography.svelte'
  import type { ClientNoId, EnrichedClient } from '$lib/types'
  import DeleteModal from './delete-modal.svelte'
  import ErrorComp from './error.svelte'
  import type { z, ZodFormattedError } from 'zod'
  import { emailFormSchema } from '$lib/schemas'
  import Vertical from './ui/vertical.svelte'
  import Horizontal from './ui/horizontal.svelte'
  import ResponsiveLayout from './ui/responsive-layout.svelte'
  import { layoutStore } from '$lib/stores/layout.svelte'
  import LoaderButton from './loader-button.svelte'

  type Props = {
    close: () => void
    client?: EnrichedClient
  }

  let { close, client }: Props = $props()

  const date = new Date()
  let name = $state('')
  let birthDate: Date | undefined = $state()
  let email = $state('')
  let formType: 'edit' | 'create' = $derived(client ? 'edit' : 'create')
  let showConfirmModal = $state(false)
  let error: string | undefined = $state()
  let emailError: ZodFormattedError<z.infer<typeof emailFormSchema>> | undefined = $state()
  let emailValid = $state(true)
  let emailTouched = $state(false)
  const createDisabled = $derived(name === '' || !birthDate || birthDate > date || !emailValid)

  $effect(() => {
    if (client) {
      name = client.name
      birthDate = new Date(client.birth_date)
      email = client.email
    }
  })

  function create() {
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
      appStore.addClient(client)
      name = ''
      birthDate = undefined
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

  function updateClient() {
    if (!client || !birthDate) {
      return
    }

    client.update({
      name,
      birth_date: birthDate.toDateString(),
    })
    close()
  }

  function deleteClient() {
    if (!client) {
      return
    }
    showConfirmModal = false
    client.delete()
    close()
  }

  function confirmDeleteClient() {
    showConfirmModal = true
  }

  function validateEmailAddress() {
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
  }
</script>

{#snippet birthDateError()}
  {$_('error.birthDateError')}
{/snippet}

{#snippet emailErrorSnippet()}
  {$_('error.emailError')}
{/snippet}

<Vertical class="max-width560">
  <Horizontal>
    {#if formType === 'create'}
      <Typography variant="h4">{$_('page.client.addClient')}</Typography>
    {:else}
      <Typography variant="h4">{$_('page.client.editClient')}</Typography>
    {/if}
    <div class="grower"></div>
    <Button variant="ghost" dimension="compact" onclick={close}><Close size={20} /></Button>
  </Horizontal>
  <div class="spacer"></div>
  <Input
    autofocus={!layoutStore.mobile}
    variant="solid"
    dimension="compact"
    placeholder={$_('page.client.clientName')}
    label={$_('common.name')}
    bind:value={name}
  ></Input>
  <LocalizedDateInput
    variant="solid"
    dimension="compact"
    yearPlaceholder="1990"
    monthPlaceholder="01"
    dayPlaceholder="01"
    label={$_('common.birthDate')}
    bind:value={birthDate}
    error={birthDate && birthDate > date ? birthDateError : undefined}
  />
  <Input
    variant="solid"
    dimension="compact"
    placeholder={$_('common.emailOptional')}
    label={$_('common.email')}
    bind:value={email}
    error={emailTouched && email.trim() !== '' && emailError?.email?._errors
      ? emailErrorSnippet
      : undefined}
    oninput={() => (emailTouched = true)}
    onblur={validateEmailAddress}>{$_('page.client.clientEmailExplanation')}</Input
  >
  {#if error}
    <ErrorComp>{error}</ErrorComp>
  {:else}
    <div class="spacer"></div>
  {/if}
  <ResponsiveLayout --responsive-justify-content="stretch">
    {#if formType === 'create'}
      <LoaderButton variant="strong" dimension="compact" onclick={create} disabled={createDisabled}>
        {$_('page.client.createClient')}
      </LoaderButton>
    {:else}
      <LoaderButton
        variant="strong"
        dimension="compact"
        onclick={updateClient}
        disabled={createDisabled}
      >
        {$_('common.saveChanges')}
      </LoaderButton>
    {/if}
    <Button variant="ghost" dimension="compact" onclick={cancel}>{$_('common.cancel')}</Button>
    {#if formType === 'edit'}
      {#if !layoutStore.mobile}<div class="grower"></div>{/if}
      <Button variant="ghost" dimension="compact" onclick={confirmDeleteClient} danger
        >{$_('page.client.deleteClient')}</Button
      >
    {/if}
  </ResponsiveLayout>
</Vertical>

<DeleteModal
  confirm={deleteClient}
  oncancel={() => (showConfirmModal = false)}
  bind:open={showConfirmModal}
  title={$_('page.client.clientDelete')}
  text={$_('page.client.clientDeleteExplanation')}
/>

<style>
  .grower {
    flex: 1;
  }
  :global(.max-width560) {
    max-width: 560px;
    width: 100%;
  }
  .spacer {
    margin-top: var(--half-padding);
  }
</style>
