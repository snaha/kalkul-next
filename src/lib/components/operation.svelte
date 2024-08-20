<script lang="ts">
	import type { Deposit, Withdrawal } from '$lib/types'
	import { _ } from 'svelte-i18n'

	interface Props {
		operation: Deposit | Withdrawal
		currency: Intl.NumberFormat
		children?: import('svelte').Snippet
	}

	let { operation, currency, children }: Props = $props()
	function formatFrequency() {
		if (operation.isRecurring) {
			switch (operation.frequency) {
				case 'day':
					return ` / ${$_('day')}`
				case 'week':
					return ` / ${$_('week')}`
				case 'month':
					return ` / ${$_('month')}`
				case 'year':
					return ` / ${$_('year')}`
			}
		}
		return ''
	}
</script>

<div class="flex-container">
	<div class="info-of-operation">
		<p class="operation-name">{operation.name}</p>
		<p class="operation-amount">
			{currency.format(operation.amount)}&nbsp;{formatFrequency()}
		</p>
		<p class="operation-date">
			{operation.startDate.toLocaleDateString()}{operation.isRecurring
				? ' - ' + operation.endDate.toLocaleDateString()
				: ''}
		</p>
	</div>
	<div class="operation-icon">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.flex-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 0.75rem;
		gap: 0.5rem;
		justify-content: space-between;
		background: var(--colors-base);
		border-radius: 0.25rem;
	}
	.info-of-operation {
		display: flex;
		flex-direction: column;
	}
	p {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: Arial;
		font-style: normal;
		font-weight: 400;
		align-self: stretch;
	}
	.operation-name {
		color: var(--colors-high, #555);
		font-size: 0.75rem;
		line-height: 1rem;
		letter-spacing: 0.0375rem;
	}
	.operation-amount {
		color: var(--colors-ultraHigh, #303030);
		font-size: 1rem;
		line-height: 1.5rem;
		letter-spacing: 0.02rem;
		margin: 0.5rem 0;
	}
	.operation-date {
		color: var(--colors-ultraHigh, #303030);
		font-size: 0.75rem;
		line-height: 1.5rem;
		letter-spacing: 0.015rem;
	}
	.operation-icon {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
</style>
