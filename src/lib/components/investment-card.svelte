<script lang="ts">
	import { transactionStore } from '$lib/stores/transaction.svelte'

	import { cascadeDuplicateInvestment } from '$lib/cascade'

	import type { Investment, Portfolio } from '$lib/types'
	import {
		ArrowRight,
		Copy,
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
	import { SERIES_COLORS } from '$lib/colors'
	import Horizontal from './ui/horizontal.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import Vertical from './ui/vertical.svelte'
	import adapters from '$lib/adapters'
	import { calculateTotalAmount } from '$lib/calc'

	type Props = {
		investment: Investment
		portfolio: Portfolio
		viewOnly?: boolean
		index: number
	}

	let { investment, portfolio, viewOnly = false, index }: Props = $props()

	const transactions = $derived(transactionStore.filter(investment.id))
	const totalDeposits = $derived(calculateTotalAmount(transactions, 'deposit'))
	const totalWithdrawals = $derived(calculateTotalAmount(transactions, 'withdrawal'))

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
	async function deleteInvestment(investmentId: number) {
		await adapters.deleteInvestment({ id: investmentId })
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" onclick={cardOpenInvestment}>
	<Horizontal --horizontal-gap="var(--quarter-padding)">
		<div class="color-box" style={`background-color: ${SERIES_COLORS[index]}`}></div>
		<Typography variant="h5">{investment.name}</Typography>
		<Badge>{investment.apy}%</Badge>
		<FlexItem />
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
					<ListItem onclick={() => deleteInvestment(investment.id)}
						><TrashCan size={24} />{$_('Delete investment')}</ListItem
					>
				</List>
			</Dropdown>
		{/if}
	</Horizontal>
	<Vertical --vertical-gap="var(--quarter-padding)">
		<Horizontal>
			<Typography>{$_('Total deposits')}</Typography>
			<FlexItem />
			<Typography>{formatCurrency(totalDeposits, portfolio.currency)}</Typography>
		</Horizontal>
		<Horizontal>
			<Typography>{$_('Total withdrawals')}</Typography>
			<FlexItem />
			<Typography>{formatCurrency(totalWithdrawals, portfolio.currency)}</Typography>
		</Horizontal>
	</Vertical>
</div>

<style type="postcss">
	.card {
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		background-color: var(--colors-base);
		padding: var(--padding);
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
		cursor: pointer;
		transition: border 0.2s;
		transition-timing-function: ease-in;
	}
	.card:hover {
		border: 1px solid var(--colors-ultra-high);
		transition: border 0.2s;
		transition-timing-function: ease-out;
	}
	.color-box {
		width: 36px;
		height: 24px;
		border-radius: var(--border-radius);
	}
</style>
