<script lang="ts">
	import DeleteModal from './delete-modal.svelte'
	import { Close, Checkmark, TrashCan, DocumentImport } from 'carbon-icons-svelte'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import { type Investment, type Portfolio } from '$lib/types'
	import {
		DEFAULT_ENTRY_FEE_TYPE,
		DEFAULT_FEE_TYPE,
		type EntryFeeType,
		type FeeType,
	} from '$lib/@snaha/kalkul-maths'
	import adapter from '$lib/adapters'
	import Select from '$lib/components/ui/select/select.svelte'
	import Option from '$lib/components/ui/select/option.svelte'
	import { investmentStore } from '$lib/stores/investment.svelte'
	import { capitalizeFirstLetter } from '$lib/utils'
	import Toggle from './ui/toggle.svelte'
	import { notImplemented } from '$lib/not-implemented'
	import Dropdown from './ui/dropdown.svelte'
	import ContentLayout from './content-layout.svelte'
	import Vertical from './ui/vertical.svelte'
	import Horizontal from './ui/horizontal.svelte'

	type Props = {
		portfolio: Portfolio
		investment?: Investment
		close: () => void
	}

	let { portfolio, investment, close }: Props = $props()

	const defaultName =
		capitalizeFirstLetter($_('investment')) +
		' ' +
		(investmentStore.filter(portfolio.id).length + 1).toString()

	let name = $state(defaultName)
	let type = $state('')
	let apy = $state('0')
	let ter = $state(0)
	let entryFee = $state(0)
	let entryFeeType: EntryFeeType = $state(DEFAULT_ENTRY_FEE_TYPE)
	let exitFee = $state(0)
	let exitFeeType: FeeType = $state('percentage')
	let successFee = $state(0)
	let managementFee = $state(0)
	let managementFeeType: FeeType = $state('percentage')

	let createDisabled = $derived(name === '')
	const formType: 'edit' | 'create' = $derived(investment ? 'edit' : 'create')
	let showConfirmModal = $state(false)

	let advancedFees = $state(false)
	let isinNumber = $state('')

	$effect(() => {
		if (!investment) {
			return
		}
		name = investment.name
		apy = (investment.apy || 0).toString()
		entryFee = investment.entry_fee || 0
		entryFeeType = stringToEntryFeeType(investment.entry_fee_type || DEFAULT_ENTRY_FEE_TYPE)
		exitFee = investment.exit_fee || 0
		exitFeeType = stringToFeeType(investment.exit_fee_type || DEFAULT_FEE_TYPE)
		successFee = investment.success_fee || 0
		managementFee = investment.management_fee || 0
		managementFeeType = stringToFeeType(investment.management_fee_type || DEFAULT_FEE_TYPE)
		advancedFees = investment.advanced_fees || false
		ter = investment.ter || 0
		type = investment.type || ''
	})

	async function createInvestment() {
		await adapter.addInvestment({
			portfolio_id: portfolio.id,
			name,
			apy: Number(apy),
			entry_fee: Number(entryFee),
			entry_fee_type: entryFeeType,
			exit_fee: Number(exitFee),
			exit_fee_type: exitFeeType,
			success_fee: advancedFees ? Number(successFee) : 0,
			management_fee: advancedFees ? Number(managementFee) : 0,
			management_fee_type: managementFeeType,
			advanced_fees: advancedFees,
			ter: advancedFees ? 0 : Number(ter),
			type,
		})
		close()
	}

	async function updateInvestment() {
		if (!investment) {
			return
		}
		await adapter.updateInvestment({
			id: investment.id,
			portfolio_id: portfolio.id,
			name,
			apy: Number(apy),
			entry_fee: Number(entryFee),
			entry_fee_type: entryFeeType,
			exit_fee: Number(exitFee),
			exit_fee_type: exitFeeType,
			success_fee: advancedFees ? Number(successFee) : 0,
			management_fee: advancedFees ? Number(managementFee) : 0,
			management_fee_type: managementFeeType,
			advanced_fees: advancedFees,
			ter: advancedFees ? 0 : Number(ter),
			type,
		})
		close()
	}

	function cancel(event: Event) {
		// FIXME: not sure why this is needed here, but it won't work without it
		event.preventDefault()
		close()
	}

	async function deleteInvestment() {
		if (!investment) {
			return
		}

		await adapter.deleteInvestment({ id: investment.id })
		close()
	}

	function confirmDeleteInvestment() {
		showConfirmModal = true
	}

	function stringToEntryFeeType(entryFeeType: string): EntryFeeType {
		if (entryFeeType === 'forty-sixty') {
			return entryFeeType
		} else if (entryFeeType === 'upfront') {
			return entryFeeType
		} else {
			return DEFAULT_ENTRY_FEE_TYPE
		}
	}

	function stringToFeeType(feeType: string): FeeType {
		if (feeType === 'fixed') {
			return 'fixed'
		} else {
			return 'percentage'
		}
	}
</script>

<ContentLayout>
	<Vertical class="max-width-560">
		<section class="horizontal">
			{#if formType === 'create'}
				<Typography variant="h4">{$_('addInvestment')}</Typography>
			{:else}
				<Typography variant="h4">{$_('Edit investment')}</Typography>
			{/if}
			<div class="grower"></div>
			<Typography>{$_('in')} {portfolio.name}</Typography>
		</section>
		<div class="spacer"></div>
		<Typography variant="h5">{$_('details')}</Typography>
		<section class="horizontal half-gap">
			<Input
				dimension="compact"
				variant="solid"
				bind:value={name}
				placeholder={defaultName}
				label={$_('investmentName')}
				class="grower"
			></Input>
			<Dropdown buttonDimension="compact" buttonVariant="solid" left autoClose={false}>
				{#snippet button()}
					<DocumentImport size={24} />
				{/snippet}
				<div class="dropdown">
					<Typography variant="h5">{$_('Import data for this investment')}</Typography>
					<div class="horizontal half-gap">
						<Input
							dimension="compact"
							variant="solid"
							bind:value={isinNumber}
							label={$_('ISIN number')}
						></Input>
						<Button variant="strong" dimension="compact" onclick={notImplemented}
							><Checkmark size={24} />{$_('Import data')}</Button
						>
					</div>
				</div>
			</Dropdown>
		</section>
		<Input
			dimension="compact"
			variant="solid"
			bind:value={type}
			placeholder={$_('E.g. "Equity"')}
			label={$_('Type (optional)')}
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
		<Horizontal>
			<Typography variant="h5">{$_('fees')}</Typography>
			<div class="grower"></div>
			<Toggle label={$_('advancedSetup')} bind:checked={advancedFees} dimension="compact"></Toggle>
		</Horizontal>
		{#if advancedFees}
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
					unit={managementFeeType === 'percentage' ? '%' : portfolio.currency}
					bind:value={managementFee}
					step={'.001'}
					min={0}
					class="grower"
				></Input>
			</section>
		{:else}
			<Input
				type="number"
				variant="solid"
				dimension="compact"
				placeholder={'0'}
				label={$_('ter')}
				unit="%"
				min={0}
				step={'0.001'}
				bind:value={ter}
			></Input>
		{/if}
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
				unit={exitFeeType === 'percentage' ? '%' : portfolio.currency}
				bind:value={exitFee}
				step={'.001'}
				min={0}
				class="grower"
			></Input>
		</section>

		<section class="buttons horizontal">
			{#if formType === 'create'}
				<Button
					variant="strong"
					dimension="compact"
					onclick={createInvestment}
					disabled={createDisabled}><Checkmark size={24} />{$_('createInvestment')}</Button
				>
			{:else}
				<Button
					variant="strong"
					dimension="compact"
					onclick={updateInvestment}
					disabled={createDisabled}><Checkmark size={24} />{$_('Done')}</Button
				>
			{/if}
			<Button variant="secondary" dimension="compact" onclick={cancel}
				><Close size={24} />{$_('cancel')}</Button
			>
			{#if formType === 'edit'}
				<div class="grower"></div>
				<Button
					variant="ghost"
					dimension="compact"
					onclick={confirmDeleteInvestment}
					disabled={createDisabled}><TrashCan size={24} />{$_('Delete investment')}</Button
				>
			{/if}
		</section>
	</Vertical>
</ContentLayout>

<DeleteModal
	confirm={deleteInvestment}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('Delete investment?')}
	text={$_('This investment will be deleted permanently. There’s no undo.')}
/>

<style>
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-end;
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
	.half-gap {
		gap: var(--half-padding);
	}
	.dropdown {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		padding: var(--padding);
		border: 1px solid var(--colors-low);
		border-radius: 0.25rem;
		background: var(--colors-base);
	}
	:global(.max-width-560) {
		max-width: 560px;
		width: 100%;
	}
</style>
