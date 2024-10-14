<script lang="ts">
	import { goto } from '$app/navigation'
	import AddClient from '$lib/components/add-client.svelte'
	import routes from '$lib/routes'
	import type { ClientNoId } from '$lib/types'
	import adapter from '$lib/adapters'

	async function createClient(client: ClientNoId) {
		try {
			await adapter.addClient(client)
			goto(routes.HOME)
		} catch (error) {
			console.error(error)
		}
	}

	function close() {
		try {
			console.debug('close clicked')
			// goto(routes.HOME)
			// event.preventDefault()
			goto('/')
		} catch (error) {
			console.error(error)
		}
	}
</script>

<main>
	<AddClient {close} createClient={(client) => createClient(client)} />
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
</style>
