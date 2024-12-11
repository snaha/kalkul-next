<script lang="ts">
	import { cascadeDeleteInvestment, cascadeDuplicateInvestment } from '$lib/cascade'

	import type { Investment, Portfolio } from '$lib/types'
	import {
		ArrowRight,
		Copy,
		Download,
		Export,
		OverflowMenuVertical,
		Settings,
		TrashCan,
		ViewOff,
	} from 'carbon-icons-svelte'
	import Badge from './ui/badge.svelte'
	import Button from './ui/button.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import { formatCurrency } from '$lib/utils'
	import { goto } from '$app/navigation'
	import routes from '$lib/routes'
	import { notImplemented } from '$lib/not-implemented'
	import Dropdown from './ui/dropdown.svelte'
	import List from './ui/list/list.svelte'
	import ListItem from './ui/list/list-item.svelte'

	type Props = {
		investment: Investment
		portfolio: Portfolio
		viewOnly?: boolean
	}

	let { investment, portfolio, viewOnly = false }: Props = $props()

	function cardOpenInvestment(e: MouseEvent) {
		if (viewOnly) {
			return
		}
		if (e.defaultPrevented) {
			return
		}
		openInvestment()
	}

	function openInvestment() {
		goto(routes.INVESTMENT(portfolio.client, portfolio.id, investment.id))
	}

	function editInvestment() {
		goto(routes.EDIT_INVESTMENT(portfolio.client, portfolio.id, investment.id))
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" onclick={cardOpenInvestment}>
	<div class="title">
		<Typography variant="h5">{investment.name}</Typography>
		<Badge>{investment.apy}%</Badge>
		<div class="grower"></div>
		{#if viewOnly}
			<Button variant="ghost" dimension="compact" onclick={notImplemented}
				><ViewOff size={16} /></Button
			>
		{:else}
			<Dropdown left buttonDimension="compact">
				{#snippet button()}
					<OverflowMenuVertical size={16} />
				{/snippet}
				<List>
					<ListItem onclick={openInvestment}
						><ArrowRight size={24} />{$_('Open investment')}</ListItem
					>
					<ListItem onclick={notImplemented}><ViewOff size={24} />{$_('Hide in charts')}</ListItem>
					<ListItem onclick={editInvestment}
						><Settings size={24} />{$_('Edit investment details')}</ListItem
					>
					<ListItem onclick={() => cascadeDuplicateInvestment(investment, investment.portfolio)}
						><Copy size={24} />{$_('Duplicate investment')}</ListItem
					>
					<ListItem onclick={() => cascadeDeleteInvestment(investment.id)}
						><TrashCan size={24} />{$_('Delete investment')}</ListItem
					>
				</List>
			</Dropdown>
		{/if}
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
