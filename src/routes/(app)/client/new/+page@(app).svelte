<script lang="ts">
  import { goto } from '$app/navigation'
  import EditClient from '$lib/components/edit-client.svelte'
  import routes from '$lib/routes'
  import Fullscreen from '$lib/components/fullscreen.svelte'

  function close() {
    goto(routes.HOME)
  }
</script>

<Fullscreen>
  <EditClient {close} />
</Fullscreen>
