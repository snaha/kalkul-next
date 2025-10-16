<script lang="ts">
	import DeleteModal from '$lib/components/delete-modal.svelte'
	import { Checkmark, Close, DocumentImport, InformationFilled } from 'carbon-icons-svelte'
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
	import Select from '$lib/components/ui/select/select.svelte'
	import { demoStore } from '$lib/demo/stores/demo.svelte'
	import { asyncTimeout, capitalizeFirstLetter } from '$lib/utils'
	import Toggle from '$lib/components/ui/toggle.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import ImportInvestmentModal from '$lib/components/import-investment-modal.svelte'
	import HelperTooltip from '$lib/components/helper-tooltip.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import ResponsiveLayout from '$lib/components/ui/responsive-layout.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'

	type Props = {
		portfolio: Portfolio
		investment?: Investment
		close: () => void
	}

	let { portfolio, investment, close }: Props = $props()

	const defaultName =
		capitalizeFirstLetter($_('common.investment')) +
		' ' +
		(demoStore.investments.length + 1).toString()

	let name = $state(defaultName)
	let type = $state('')
	let apy = $state(0)
	let ter = $state(0)
	let entryFee = $state(0)
	let entryFeeType: EntryFeeType = $state(DEFAULT_ENTRY_FEE_TYPE)
	let exitFee = $state(0)
	let exitFeeType: FeeType = $state('percentage')
	let successFee = $state(0)
	let managementFee = $state(0)
	let managementFeeType: FeeType = $state('percentage')

	let createClicked = $state(false)
	const createDisabled = $derived(name === '' || createClicked)
	const formType: 'edit' | 'create' = $derived(investment ? 'edit' : 'create')
	let showConfirmModal = $state(false)

	let advancedFees = $state(false)
	let isImportInvestmentModalOpen = $state(false)

	let showTERHelper = $state(false)
	let showEntryFeeHelper = $state(false)
	let showExitFeeHelper = $state(false)
	let showSuccessFeeHelper = $state(false)
	let showManagementFeeHelper = $state(false)

	$effect(() => {
		if (!investment) {
			return
		}

		name = investment.name
		apy = investment.apy || 0
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
		createClicked = true
		await asyncTimeout(0)

		// In demo mode, just transition to state 2 (single investment)
		demoStore.addInvestment()
		close()
	}

	async function updateInvestment() {
		if (!investment) {
			return
		}

		createClicked = true
		await asyncTimeout(0)

		demoStore.updateInvestment({
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
			created_at: investment.created_at,
			last_edited_at: investment.last_edited_at,
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

		demoStore.deleteInvestment(investment.id)
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

	// DEMO: Keyboard listener to prefill form values for demonstration
	$effect(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'ArrowRight') {
				// DEMO PREFILL VALUES
				name = 'Eurizon AM Slovakia – Akciové Portfólio'
				apy = 8.68
				ter = 1.45
				entryFee = 2.5
			}
		}

		window.addEventListener('keydown', handleKeydown)

		return () => {
			window.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

{#snippet APYError()}
	<Horizontal --horizontal-gap="var(--half-padding)">
		<InformationFilled size={24} />
		{$_('component.editInvestment.noImportDataFound')}
	</Horizontal>
{/snippet}

<Vertical class="max-width-560" --vertical-gap="var(--double-padding)">
	<Horizontal>
		{#if formType === 'create'}
			<Typography variant="h4">{$_('component.editInvestment.addInvestment')}</Typography>
		{:else}
			<Typography variant="h4">{$_('component.editInvestment.editInvestment')}</Typography>
		{/if}
		<div class="grower"></div>
		<Button variant="ghost" dimension="compact" onclick={close}><Close size={20} /></Button>
	</Horizontal>
	<Vertical --vertical-gap="var(--padding)">
		<Horizontal --horizontal-justify-content="space-between">
			<Typography variant="h5">{$_('common.details')}</Typography>
			<Button
				dimension="compact"
				variant="ghost"
				onclick={() => (isImportInvestmentModalOpen = true)}
			>
				<DocumentImport size={24} />
				{$_('common.importData')}
			</Button>
		</Horizontal>
		<section class="horizontal half-gap">
			<Input
				dimension="compact"
				variant="solid"
				bind:value={name}
				placeholder={defaultName}
				label={$_('component.editInvestment.investmentName')}
				class="grower"
			></Input>
			<Input
				dimension="compact"
				variant="solid"
				bind:value={apy}
				placeholder={'0'}
				label={$_('common.apy')}
				unit="%"
				type="number"
				step={0.001}
				min={0}
				error={apy === undefined ? APYError : undefined}
				class="grower"
			></Input>
		</section>
		<Horizontal>
			<Typography variant="h5">{$_('common.fees')}</Typography>
			<div class="grower"></div>
			<Toggle
				label={$_('component.editInvestment.advancedSetup')}
				bind:checked={advancedFees}
				dimension="compact"
			></Toggle>
		</Horizontal>
		{#if advancedFees}
			<section class="horizontal">
				<Input
					variant="solid"
					dimension="compact"
					placeholder={'0'}
					label={$_('common.successFee')}
					unit="%"
					min={0}
					step={0.001}
					bind:value={successFee}
					class="grower"
				></Input>
				<HelperTooltip
					bind:show={showSuccessFeeHelper}
					helperText={$_('component.editInvestment.successFeeHelper')}
				/>
			</section>

			<section class="horizontal">
				<Select
					variant="solid"
					dimension="compact"
					bind:value={managementFeeType}
					label={$_('common.managementFee')}
					class="grower"
					items={[
						{ value: 'percentage', label: $_('common.percentage') },
						{ value: 'fixed', label: $_('common.fixedFee') },
					]}
				></Select>
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
				<HelperTooltip
					bind:show={showManagementFeeHelper}
					helperText={$_('component.editInvestment.managementFeeHelper')}
				/>
			</section>
		{:else}
			<section class="horizontal">
				<Input
					type="number"
					variant="solid"
					dimension="compact"
					placeholder={'0'}
					label={$_('common.ter')}
					unit="%"
					min={0}
					step={'0.001'}
					bind:value={ter}
					class="grower"
				></Input>
				<HelperTooltip
					bind:show={showTERHelper}
					helperText={$_('component.editInvestment.terHelper')}
				/>
			</section>
		{/if}
		<section class="horizontal">
			<Input
				type="number"
				variant="solid"
				dimension="compact"
				bind:value={entryFee}
				placeholder={'0'}
				label={$_('common.entryFee')}
				unit="%"
				step={'.001'}
				min={0}
				class="grower"
			></Input>
			<Select
				variant="solid"
				dimension="compact"
				bind:value={entryFeeType}
				label={$_('common.entryFeePayment')}
				class="grower"
				items={[
					{ value: 'ongoing', label: $_('common.ongoing') },
					{ value: 'forty-sixty', label: '40/60' },
					{ value: 'upfront', label: $_('common.upfront') },
				]}
			></Select>
			<HelperTooltip
				bind:show={showEntryFeeHelper}
				helperText={$_('component.editInvestment.entryFeeHelper')}
			/>
		</section>

		<section class="horizontal">
			<Select
				variant="solid"
				dimension="compact"
				bind:value={exitFeeType}
				label={$_('common.exitFee')}
				class="grower"
				items={[
					{ value: 'percentage', label: $_('common.percentage') },
					{ value: 'fixed', label: $_('common.fixedFee') },
				]}
			></Select>
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
			<HelperTooltip
				bind:show={showExitFeeHelper}
				helperText={$_('component.editInvestment.exitFeeHelper')}
			/>
		</section>
	</Vertical>

	<ResponsiveLayout --responsive-justify-content="stretch">
		{#if formType === 'create'}
			<Button
				variant="strong"
				dimension="compact"
				onclick={createInvestment}
				disabled={createDisabled}
				busy={createClicked}
				>{#if createClicked}<Loader dimension="large" color="low" />{:else}<Checkmark
						size={24}
					/>{/if}{$_('component.editInvestment.createInvestment')}</Button
			>
		{:else}
			<Button
				variant="strong"
				dimension="compact"
				onclick={updateInvestment}
				disabled={createDisabled}
				busy={createClicked}
				>{#if createClicked}<Loader dimension="large" color="low" />{/if}{$_(
					'common.saveChanges',
				)}</Button
			>
		{/if}
		<Button variant="ghost" dimension="compact" onclick={cancel}>{$_('common.cancel')}</Button>
		{#if formType === 'edit'}
			{#if !layoutStore.mobile}<div class="grower"></div>{/if}
			<Button
				variant="ghost"
				dimension="compact"
				onclick={confirmDeleteInvestment}
				disabled={createDisabled}
				danger>Delete</Button
			>
		{/if}
	</ResponsiveLayout>
</Vertical>

<DeleteModal
	confirm={deleteInvestment}
	oncancel={() => (showConfirmModal = false)}
	bind:open={showConfirmModal}
	title={$_('component.editInvestment.deleteInvestmentWarningTitle')}
	text={$_('component.editInvestment.deleteInvestmentWarning')}
/>

<ImportInvestmentModal
	oncancel={() => (isImportInvestmentModalOpen = false)}
	bind:open={isImportInvestmentModalOpen}
	bind:name
	bind:type
	bind:apy
	currency={portfolio.currency}
/>

<style>
	.horizontal {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-end;
		gap: var(--half-padding);
		min-width: 320px;
	}
	.horizontal :global(.grower) {
		flex-grow: 1;
		flex-shrink: 1;
		min-width: 0;
	}
	.horizontal > :global(*) {
		flex-shrink: 1;
		min-width: 0;
	}
	.half-gap {
		gap: var(--half-padding);
	}
	:global(.max-width-560) {
		max-width: 560px;
		width: 100%;
		min-width: 320px;
	}
	.horizontal :global(.grower .col),
	.horizontal :global(.grower .wrapper),
	.horizontal :global(.grower .relative),
	.horizontal :global(.grower input) {
		min-width: 0;
	}
</style>
