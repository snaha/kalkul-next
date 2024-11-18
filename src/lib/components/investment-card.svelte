<script lang="ts">
	import type { Investment, Portfolio } from '$lib/types'
	import { Download, Export, OverflowMenuVertical } from 'carbon-icons-svelte'
	import Badge from './ui/badge.svelte'
	import Button from './ui/button.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { formatCurrency } from '$lib/utils'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'

	type Props = {
		investment: Investment
		portfolio: Portfolio
	}

	let { investment, portfolio }: Props = $props()

	function openInvestment() {
		goto(routes.INVESTMENT(portfolio.client, portfolio.id, investment.id))
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" onclick={openInvestment}>
	<div class="title">
		<Typography variant="h5">{investment.name}</Typography>
		<Badge>{investment.apy}%</Badge>
		<div class="grower"></div>
		<Button variant="ghost" dimension="compact"><OverflowMenuVertical size={16} /></Button>
	</div>
	<div class="info">
		<span>
			<Download size={16} /><Typography font="mono" variant="small"
				>{formatCurrency(100000, portfolio.currency)} ({$_('total deposits')})</Typography
			>
		</span>
		<span>
			<Export size={16} /><Typography font="mono" variant="small"
				>{formatCurrency(0, portfolio.currency)} ({$_('total withdrawals')})</Typography
			>
		</span>
	</div>
</div>

<style type="postcss">
	.card {
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		background-color: var(--colors-base);
		padding: var(--half-padding);
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		cursor: pointer;
	}
	.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--quarter-padding);
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: 1px;

		span {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 1px;
		}
	}
</style>
