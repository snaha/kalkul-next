<script lang="ts">
  import Button from '$lib/components/ui/button.svelte'
  import SearchInput from '$lib/components/ui/input/search-input.svelte'
  import Typography from '$lib/components/ui/typography.svelte'
  import {
    OverflowMenuVertical,
    FolderShared,
    UserProfile,
    TrashCan,
    ArrowRight,
  } from 'carbon-icons-svelte'
  import { _ } from 'svelte-i18n'
  import { formatAge } from '$lib/utils'
  import { formatDate } from '$lib/@snaha/kalkul-maths/date'
  import Avatar from '$lib/components/avatar.svelte'
  import Loader from '$lib/components/ui/loader.svelte'
  import { goto } from '$app/navigation'
  import routes from '$lib/routes'
  import { portfolioStore } from '$lib/stores/portfolio.svelte'
  import { clientStore } from '$lib/stores/clients.svelte'
  import Header from '$lib/components/header.svelte'
  import Dropdown from '$lib/components/ui/dropdown.svelte'
  import List from '$lib/components/ui/list/list.svelte'
  import ListItem from '$lib/components/ui/list/list-item.svelte'
  import adapter from '$lib/adapters'
  import DeleteModal from '$lib/components/delete-modal.svelte'
  import { base } from '$app/paths'
  import DesktopOnly from '$lib/components/desktop-only.svelte'
  import MobileOnly from '$lib/components/mobile-only.svelte'
  import Vertical from '$lib/components/ui/vertical.svelte'
  import { investmentStore } from '$lib/stores/investment.svelte'
  import Horizontal from '$lib/components/ui/horizontal.svelte'
  import ContentLayout from '$lib/components/content-layout.svelte'

  let showConfirmModal = $state(false)
  let clientToBeDeleted: string | undefined = $state()
  let searchQuery = $state('')
  let filteredClient = $derived(
    searchByName(searchQuery).toSorted(
      (a, b) => new Date(a.created_at).getDate() - new Date(b.created_at).getDate(),
    ),
  )
  function addClient() {
    goto(routes.NEW_CLIENT)
  }

  function confirmDeleteClient(clientId: string) {
    showConfirmModal = true
    clientToBeDeleted = clientId
  }

  async function deleteClient() {
    if (clientToBeDeleted) {
      await adapter.deleteClient({ id: clientToBeDeleted })
      clientToBeDeleted = undefined
      showConfirmModal = false
    }
  }
  function searchByName(searchQuery: string) {
    if (searchQuery) {
      return clientStore.data.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    } else {
      return clientStore.data
    }
  }
</script>

{#snippet clientDropdown(clientId: string)}
  <Dropdown left buttonDimension="compact">
    {#snippet button()}
      <OverflowMenuVertical size={24} />
    {/snippet}
    <List>
      <ListItem onclick={() => goto(routes.CLIENT(clientId))}
        ><FolderShared size={24} />{$_('page.home.portfoliosView')}</ListItem
      >
      <ListItem onclick={() => goto(routes.EDIT_CLIENT(clientId))}
        ><UserProfile size={24} />{$_('page.home.clientEdit')}</ListItem
      >
      <ListItem onclick={() => confirmDeleteClient(clientId)}
        ><TrashCan size={24} />{$_('page.home.clientDeleteButton')}</ListItem
      >
    </List>
  </Dropdown>
{/snippet}

<Header />

<ContentLayout centered={false}>
  {#if clientStore.loading}
    <Typography>{$_('common.loading')}</Typography><Loader />
  {:else if clientStore.data.length === 0}
    <section class="empty">
      <img src={`${base}/images/no-client.svg`} alt={$_('common.noClientYet')} />
      <Typography variant="h4">{$_('page.home.noClientsYet')}</Typography>
      <Typography>{$_('page.home.createYourFirstClient')}</Typography>
      <div class="spacer"></div>
      <Button variant="strong" dimension="compact" onclick={addClient}
        >{$_('page.home.addClient')}</Button
      >
    </section>
  {:else}
    <DesktopOnly>
      <section class="horizontal">
        <Typography variant="h4">{$_('page.home.allClients')}</Typography>
        <div class="grower"></div>
        <SearchInput
          bind:value={searchQuery}
          dimension="compact"
          variant="solid"
          placeholder={$_('common.search')}
        ></SearchInput>
        <Button dimension="compact" variant="strong" onclick={addClient}
          >{$_('page.home.addClient')}</Button
        >
      </section>

      <ul>
        <li class="clients title">
          <span>{$_('common.name')}</span>
          <span>{$_('common.birthDate')}</span>
          <span class="right-aligned">{$_('common.age')}</span>
          <span class="right-aligned">{$_('common.portfolios')}</span>
          <span class="right-aligned">{$_('common.investments')}</span>
          <span class="right-aligned"></span>
        </li>
        {#each filteredClient as client}
          {@const birtDate = new Date(client.birth_date)}
          {@const portfolioIds = portfolioStore.filter(client.id).map((portfolio) => portfolio.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <li
            class="clients client"
            onclick={(e: MouseEvent) => {
              if (!e.defaultPrevented) {
                goto(routes.CLIENT(client.id))
              }
            }}
          >
            <span
              ><Avatar
                name={client.name}
                birthDate={birtDate}
                imageURI={undefined}
              />{client.name}</span
            >
            <span>{formatDate(new Date(client.birth_date))}</span>
            <span class="right-aligned">{formatAge(birtDate)}</span>
            <span class="right-aligned">{portfolioIds.length}</span>
            <span class="right-aligned"
              >{portfolioIds.flatMap((portfolioId) => investmentStore.filter(portfolioId))
                .length}</span
            >
            <span class="right-aligned">{@render clientDropdown(client.id)}</span>
          </li>
        {/each}
      </ul>
    </DesktopOnly>
    <MobileOnly>
      <Vertical>
        <Horizontal --horizontal-justify-content="space-between">
          <Typography variant="h4">{$_('page.home.allClients')}</Typography>

          <Button dimension="compact" variant="strong" onclick={addClient}
            >{$_('page.home.addClient')}</Button
          >
        </Horizontal>
        <Horizontal>
          <SearchInput
            bind:value={searchQuery}
            dimension="compact"
            variant="solid"
            placeholder={$_('common.search')}
            class="grower"
          ></SearchInput>
          {#if searchQuery.length > 0}
            <Button dimension="compact" variant="ghost" onclick={() => (searchQuery = '')}
              >{$_('page.home.clearSearch')}</Button
            >
          {/if}
        </Horizontal>
      </Vertical>

      <ul class="mobile">
        {#each filteredClient as client}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <li
            class="client mobile"
            onclick={(e: MouseEvent) => {
              if (!e.defaultPrevented) {
                goto(routes.CLIENT(client.id))
              }
            }}
          >
            <span>{client.name}</span>
            <span class="right-aligned"><ArrowRight /></span>
          </li>
        {/each}
      </ul>

      <Button variant="ghost" dimension="compact" onclick={addClient}
        >{$_('page.home.addClient')}</Button
      >
    </MobileOnly>
  {/if}
</ContentLayout>

<DeleteModal
  confirm={deleteClient}
  oncancel={() => (showConfirmModal = false)}
  bind:open={showConfirmModal}
  title={$_('page.home.clientDelete')}
  text={$_('page.home.clientDeleteWarning')}
/>

<style>
  :root {
    --max-width: 1370px;
  }
  .horizontal {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: var(--half-padding);
  }
  :global(.grower) {
    flex: 1;
  }
  ul {
    padding-left: 0;
  }
  ul.mobile {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--colors-low);
    margin: 0;
  }
  li > span {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--half-padding);
    overflow-wrap: anywhere;
  }
  .clients {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 1fr 1fr 1fr;
    align-items: center;
    gap: var(--half-padding);
    border-bottom: 1px solid var(--colors-low);
    background-color: var(--colors-ultra-low);
    padding-top: var(--half-padding);
    padding-bottom: var(--half-padding);
    width: 100%;
  }
  .title {
    border-bottom: 1px solid var(--colors-ultra-high);
    color: var(--colors-ultra-high);
    font-size: var(--font-size-h5);
    font-family: var(--font-family-sans-serif);
    font-weight: 700;
  }
  .client {
    border-bottom: 1px solid var(--colors-low);
    font-size: var(--font-size);
    font-family: var(--font-family-sans-serif);
    cursor: pointer;
  }
  .client.mobile {
    display: flex;
    justify-content: space-between;
    padding: var(--padding) var(--half-padding);
    width: 100%;
    gap: var(--half-padding);
  }
  .client:hover {
    background-color: color-mix(in srgb, var(--colors-low) 25%, transparent);
  }
  .right-aligned {
    display: flex;
    justify-content: flex-end;
    text-align: right;
  }
  .empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--half-padding);
    height: 80vh;
  }
  .spacer {
    margin-top: var(--half-padding);
  }
  :global(.text-center) {
    text-align: center;
  }
  :global(.max560) {
    max-width: 560px;
    width: 100%;
  }
  :global(.bg-ultra-low) {
    background-color: var(--colors-ultra-low);
  }
</style>
