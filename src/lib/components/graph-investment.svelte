<script lang="ts">
	import type { Investment, Portfolio } from '$lib/types'
	import PortfolioGraph from './graph-portfolio.svelte'
	import { _ } from 'svelte-i18n'

	interface Props {
		investment: Investment
		portfolio: Portfolio
		colorIndex: number
	}

	const { investment, portfolio, colorIndex }: Props = $props()
</script>

<PortfolioGraph
	title={$_('Investment value')}
	{portfolio}
	investments={[investment]}
	{colorIndex}
/>
