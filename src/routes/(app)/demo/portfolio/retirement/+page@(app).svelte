<script lang="ts">
	import RetirementCalculator from '$lib/demo/components/retirement-calculator.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'

	// Demo mode - use mock client matching Client type
	const client = {
		id: -1,
		name: 'Demo' + ' ' + 'Client', // Internal: not user-facing
		birth_date: '1990-01-01',
		advisor: '',
		created_at: new Date().toISOString(),
		email: 'demo@example.com',
	}

	function close() {
		history.back()
	}
</script>

<Fullscreen>
	<RetirementCalculator {close} {client} />
</Fullscreen>
