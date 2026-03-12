<script lang="ts">
  import Button from '$lib/components/ui/button.svelte'
  import Logo from '$lib/components/icons/logo.svelte'
  import { ChatBot, SettingsEdit } from 'carbon-icons-svelte'
  import routes from '$lib/routes'
  import { _ } from 'svelte-i18n'
  import HelpModal from './help-modal.svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'

  let showHelpModal = $state(false)

  function openSettings() {
    if (page.url.pathname === routes.SETTINGS) {
      return
    }
    sessionStorage.setItem('settingsReturnTo', page.url.pathname + page.url.search)
    goto(routes.SETTINGS)
  }
</script>

<header>
  <div class="left">
    <a class="logo-link" href={routes.HOME}>
      <Logo size={32} />
    </a>
  </div>

  <div class="user-info">
    <Button
      mode="dark"
      dimension="small"
      variant="ghost"
      onclick={() => {
        showHelpModal = true
      }}><ChatBot size={16} />{$_('component.header.helpButton')}</Button
    >

    <Button mode="dark" dimension="small" variant="ghost" onclick={openSettings}>
      <SettingsEdit size={16} />
      {$_('component.header.settings')}
    </Button>
  </div>
</header>
<HelpModal bind:open={showHelpModal} oncancel={() => (showHelpModal = false)} />

<style lang="postcss">
  header {
    padding: var(--half-padding);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--colors-dark-ultra-low);
    color: var(--colors-dark-ultra-high);
  }
  .left {
    display: flex;
    align-items: center;
    gap: var(--quarter-padding);
  }
  .logo-link {
    display: flex;
    color: var(--colors-dark-ultra-high);
  }
  .user-info {
    display: flex;
    gap: var(--half-padding);
  }
</style>
