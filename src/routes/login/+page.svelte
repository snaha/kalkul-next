<script lang="ts">
	import { goto } from '$app/navigation'
	import Login from '$lib/components/login.svelte'
	import routes from '$lib/routes'
	import { authStore } from '$lib/stores/auth.svelte'

	$effect(() => {
		if (authStore.isLoggedIn) {
			goto(routes.HOME)
		}
	})
</script>

<Login />
