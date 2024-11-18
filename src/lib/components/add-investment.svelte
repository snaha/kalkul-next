<script lang="ts">
	import { Close, Checkmark } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import type { EntryFeeType, FeeType, Portfolio } from '$lib/types'
	import adapter from '$lib/adapters'
	import Select from '$lib/components/ui/select/select.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { capitalizeFirstLetter } from '$lib/utils'

	type Props = {
		portfolio: Portfolio
		close: () => void
	}

	let { portfolio, close }: Props = $props()

	const defaultName =
		capitalizeFirstLetter($_('investment')) +
		' ' +
		(investmentStore.filter(portfolio.id).length + 1).toString()

	let name = $state(defaultName)
	let currency = $state('EUR')
	let apy = $state('0')
	let entryFee = $state(0)
	let entryFeeType: EntryFeeType = $state('ongoing')
	let exitFee = $state(0)
	let exitFeeType: FeeType = $state('percentage')
	let successFee = $state(0)
	let managementFee = $state(0)
	let managementFeeType: FeeType = $state('percentage')

	let createDisabled = $derived(name === '')

	async function create() {
		await adapter.addInvestment({
			portfolio: portfolio.id,
			name,
			apy: Number(apy),
			entry_fee: Number(entryFee),
			entry_fee_type: entryFeeType,
			exit_fee: Number(exitFee),
			exit_fee_type: exitFeeType,
			success_fee: Number(successFee),
			management_fee: Number(managementFee),
			management_fee_type: managementFeeType,
		})
		close()
	}

	function cancel(event: Event) {
		// FIXME: not sure why this is needed here, but it won't work without it
		event.preventDefault()
		close()
	}
</script>

<form class="vertical">
	<section class="horizontal">
		<Typography variant="h4">{$_('addInvestment')}</Typography>
		<div class="grower"></div>
		<Typography>{$_('in')} {portfolio.name}</Typography>
	</section>
	<div class="spacer"></div>
	<Input
		dimension="compact"
		variant="solid"
		bind:value={name}
		placeholder={defaultName}
		label={$_('investmentName')}
	></Input>
	<Input
		dimension="compact"
		variant="solid"
		bind:value={apy}
		placeholder={'0'}
		label={$_('APY')}
		unit="%"
		type="number"
		step={0.001}
		min={0}
	></Input>
	<section class="horizontal">
		<Input
			type="number"
			variant="solid"
			dimension="compact"
			bind:value={entryFee}
			placeholder={'0'}
			label={$_('entryFee')}
			unit="%"
			step={'.001'}
			min={0}
			class="grower"
		></Input>
		<Select
			variant="solid"
			dimension="compact"
			bind:value={entryFeeType}
			label={$_('entryFeePayment')}
			class="grower"
		>
			<Option value="ongoing">{$_('ongoing')}</Option>
			<Option value="forty-sixty">40/60</Option>
			<Option value="upfront">{$_('upfront')}</Option>
		</Select>
	</section>

	<section class="horizontal">
		<Select
			variant="solid"
			dimension="compact"
			bind:value={exitFeeType}
			label={$_('exitFee')}
			class="grower"
		>
			<Option value="percentage">{$_('percentage')}</Option>
			<Option value="fixed">{$_('fixedFee')}</Option>
		</Select>
		<Input
			type="number"
			variant="solid"
			dimension="compact"
			placeholder={'0'}
			unit={exitFeeType === 'percentage' ? '%' : currency}
			bind:value={exitFee}
			step={'.001'}
			min={0}
			class="grower"
		></Input>
	</section>

	<Input
		variant="solid"
		dimension="compact"
		placeholder={'0'}
		label={$_('successFee')}
		unit="%"
		min={0}
		step={0.001}
		bind:value={successFee}
	></Input>

	<section class="horizontal">
		<Select
			variant="solid"
			dimension="compact"
			bind:value={managementFeeType}
			label={$_('managementFee')}
			class="grower"
		>
			<Option value="percentage">{$_('percentage')}</Option>
			<Option value="fixed">{$_('fixedFee')}</Option>
		</Select>
		<Input
			type="number"
			variant="solid"
			dimension="compact"
			placeholder={'0'}
			unit={managementFeeType === 'percentage' ? '%' : currency}
			bind:value={managementFee}
			step={'.001'}
			min={0}
			class="grower"
		></Input>
	</section>

	<section class="buttons horizontal">
		<Button variant="strong" dimension="compact" onclick={create} disabled={createDisabled}
			><Checkmark size={24} />{$_('createInvestment')}</Button
		>
		<Button variant="secondary" dimension="compact" onclick={cancel}
			><Close size={24} />{$_('cancel')}</Button
		>
	</section>
</form>

<style>
	form {
		max-width: 560px;
		flex: 1;
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-end;
		gap: var(--padding);
	}
	.vertical {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--padding);
	}
	.horizontal :global(.grower) {
		flex: 1;
	}
	.buttons {
		margin-top: var(--padding);
		gap: var(--half-padding);
	}
	.spacer {
		margin-top: var(--half-padding);
	}
</style>
