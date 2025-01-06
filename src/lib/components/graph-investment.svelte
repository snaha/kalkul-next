<script lang="ts">
	import type { Investment, Portfolio } from '$lib/types'
	import PortfolioGraph from './graph-portfolio.svelte'
	import { _ } from 'svelte-i18n'

	interface Props {
		investment: Investment
		portfolio: Portfolio
	}

	const { investment, portfolio }: Props = $props()
</script>

<PortfolioGraph title={$_('Investment value')} {portfolio} investments={[investment]} />
