<script lang="ts">
  import EditClient from '$lib/components/edit-client.svelte'
  import Fullscreen from '$lib/components/fullscreen.svelte'
  import { page } from '$app/state'
  import { clientStore } from '$lib/stores/clients.svelte'

  const clientId = page.params.id
  const client = $derived(clientStore.data.find((client) => client.id === clientId))

  function close() {
    history.back()
  }
</script>

<Fullscreen>
  <EditClient {close} {client} />
</Fullscreen>
