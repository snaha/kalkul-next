<script lang="ts">
	import { _ } from 'svelte-i18n'
	import Typography from './ui/typography.svelte'
	import type { Client, Investment, Portfolio } from '$lib/types'
	import Avatar from './avatar.svelte'
	import Toggle from './ui/toggle.svelte'
	import Badge from './ui/badge.svelte'

	type Props = {
		client: Client
		portfolio: Portfolio
		investments: Investment[]
		adjustWithInflation: boolean
	}

	let { client, portfolio, investments, adjustWithInflation = $bindable() }: Props = $props()
</script>

<Avatar size={64} name={client.name} birthDate={new Date(client.birth_date)} />
<div class="vertical">
	<Typography variant="h4" bold>{portfolio.name}</Typography>
	<div class="horizontal">
		<Typography>{`${portfolio.start_date} → ${portfolio.end_date}`}</Typography>
		{#if investments.length > 0}
			<Toggle label={$_('Show inflation')} dimension="small" bind:checked={adjustWithInflation}
			></Toggle>
			{#if adjustWithInflation}
				<Badge dimension="small">{portfolio.inflation_rate * 100}%</Badge>
			{/if}
		{/if}
	</div>
</div>

<style>
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		gap: var(--half-padding);
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
</style>
