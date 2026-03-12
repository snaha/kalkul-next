<script lang="ts">
  import Button from '$lib/components/ui/button.svelte'
  import Typography from '$lib/components/ui/typography.svelte'
  import Vertical from '$lib/components/ui/vertical.svelte'
  import Select from '$lib/components/ui/select/select.svelte'
  import { ArrowLeft, Download, Upload } from 'carbon-icons-svelte'
  import { _, locale } from 'svelte-i18n'
  import { goto } from '$app/navigation'
  import adapter from '$lib/adapters'
  import { LOCALE_STORAGE_KEY } from '$lib/locales'
  import Header from '$lib/components/header.svelte'
  import ContentLayout from '$lib/components/content-layout.svelte'
  import LoaderButton from '$lib/components/loader-button.svelte'

  let importError: string | undefined = $state()
  let importSuccess = $state(false)

  function goBack() {
    const returnTo = sessionStorage.getItem('settingsReturnTo')
    if (returnTo) {
      sessionStorage.removeItem('settingsReturnTo')
      goto(returnTo)
    } else {
      history.back()
    }
  }

  function changeLanguage(newLocale: string) {
    locale.set(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
  }

  function exportBackup() {
    const data = adapter.exportBackup()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kalkul-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importBackup() {
    importError = undefined
    importSuccess = false

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        adapter.importBackup(text)
        importSuccess = true
      } catch {
        importError = $_('settings.importError')
      }
    }
    input.click()
  }
</script>

<Header />

<ContentLayout centered={false}>
  <section class="horizontal">
    <Button dimension="compact" variant="ghost" onclick={goBack}>
      <ArrowLeft size={24} />
    </Button>
    <Typography variant="h4">{$_('settings.title')}</Typography>
  </section>

  <Vertical --vertical-gap="var(--double-padding)">
    <Vertical --vertical-gap="var(--padding)">
      <Typography variant="h5">{$_('settings.language')}</Typography>
      <Select
        variant="solid"
        dimension="compact"
        value={$locale ?? 'cs'}
        onchange={(e) => changeLanguage(e.currentTarget.value)}
        items={[
          { value: 'cs', label: 'Čeština' },
          { value: 'en', label: 'English' },
        ]}
      />
    </Vertical>

    <Vertical --vertical-gap="var(--padding)">
      <Typography variant="h5">{$_('settings.backup')}</Typography>
      <Typography>{$_('settings.backupDescription')}</Typography>
      <div class="horizontal">
        <Button variant="strong" dimension="compact" onclick={exportBackup}>
          <Download size={20} />
          {$_('settings.exportBackup')}
        </Button>
        <LoaderButton variant="secondary" dimension="compact" onclick={importBackup}>
          <Upload size={20} />
          {$_('settings.importBackup')}
        </LoaderButton>
      </div>
      {#if importError}
        <Typography --typography-color="var(--colors-red)">{importError}</Typography>
      {/if}
      {#if importSuccess}
        <Typography --typography-color="var(--colors-green)"
          >{$_('settings.importSuccess')}</Typography
        >
      {/if}
    </Vertical>
  </Vertical>
</ContentLayout>

<style>
  .horizontal {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--half-padding);
  }
</style>
