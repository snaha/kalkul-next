<script lang="ts">
	import Typography from './ui/typography.svelte'
	import type { Investment, Portfolio } from '$lib/types'
	import Horizontal from './ui/horizontal.svelte'

	type Props = {
		portfolio: Portfolio
		investments?: Investment[]
		adjustWithInflation?: boolean
	}

	let { portfolio, adjustWithInflation = $bindable() }: Props = $props()
</script>

<Horizontal --horizontal-justify-content="space-between">
	<Typography variant="h4" bold>{portfolio.name}</Typography>
</Horizontal>
