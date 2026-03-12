<script lang="ts">
  import EditClient from '$lib/components/edit-client.svelte'
  import Fullscreen from '$lib/components/fullscreen.svelte'
  import { page } from '$app/state'
  import { appStore } from '$lib/stores/app.svelte'

  const clientId = page.params.id
  const client = $derived(appStore.findClient(clientId))

  function close() {
    history.back()
  }
</script>

<Fullscreen>
  <EditClient {close} {client} />
</Fullscreen>
