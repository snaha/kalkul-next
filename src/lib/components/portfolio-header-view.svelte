<script lang="ts">
	import Typography from './ui/typography.svelte'
	import type { Investment, Portfolio } from '$lib/types'

	type Props = {
		portfolio: Portfolio
		investments?: Investment[]
		adjustWithInflation?: boolean
	}

	let { portfolio, adjustWithInflation = $bindable() }: Props = $props()
</script>

<Typography variant="h4" bold nowrap>{portfolio.name}</Typography>
