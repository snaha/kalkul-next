<script lang="ts">
	import { page } from '$app/stores'
	import { detailStore } from '$lib/stores/details.svelte'
	import { goto } from '$app/navigation'
	import { get } from 'svelte/store'
	import { isInt, initializeForm } from '$lib/utils'
	import routes from '$lib/routes'
	import type { ZodError } from 'zod'
	import type { DepositForm } from '$lib/types'
	import { depositWithdrawalFormSchema, depositWithdrawalSchema } from '$lib/schemas'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/button.svelte'
	import { Checkmark, TrashCan, Undo } from 'carbon-icons-svelte'
	import OperationForm from '$lib/components/operation-form.svelte'

	const index = get(page).params.id
	const depositIndex = isInt(index) ? Number.parseInt(index) : undefined

	let deposit = $state<DepositForm>(initializeForm(detailStore.deposits, depositIndex))
	let formValid = $state(false)
	let formErrors: ZodError | undefined = $state()

	$effect(() => {
		const res = depositWithdrawalFormSchema.safeParse(deposit)
		if (res.success) {
			formErrors = undefined
			formValid = true
		} else {
			formErrors = res.error
			formValid = false
		}
	})

	function save() {
		if (depositIndex !== undefined) {
			const res = depositWithdrawalSchema.safeParse(deposit)
			if (res.success) {
				detailStore.saveDeposit(depositIndex, res.data)
				goto(routes.HOME)
			}
		}
	}
	function deleteDeposit() {
		if (depositIndex !== undefined) {
			setTimeout(() => detailStore.removeDeposit(depositIndex), 0)
			goto(routes.HOME)
		}
	}

	function cancel() {
		goto(routes.HOME)
	}

	function add() {
		const res = depositWithdrawalSchema.safeParse(deposit)
		if (res.success) {
			detailStore.addDeposit(res.data)
			goto(routes.HOME)
		}
	}
</script>

{#if (depositIndex === undefined && Boolean(index)) || (depositIndex !== undefined && detailStore.deposits.length <= depositIndex)}
	<section>
		<h5>Vklad s indexem {index} jsme nenalezli</h5>
		<Button variant="secondary" onclick={cancel}><Undo size={24} /></Button>
	</section>
{:else if depositIndex !== undefined}
	<section>
		<h5>{$_('editedDeposit')} #{depositIndex} - "{deposit.name}"</h5>
		<OperationForm bind:operation={deposit} recurringOperationText="isDepositRecurring" />
		<div class="buttons">
			<Button variant="strong" onclick={save} disabled={!formValid}
				><Checkmark size={24} />{$_('save')}</Button
			>
			<Button variant="secondary" onclick={deleteDeposit} disabled={!formValid}
				><TrashCan size={24} />{$_('delete')}</Button
			>
			<Button variant="secondary" onclick={cancel}><Undo size={24} />{$_('cancel')}</Button>
		</div>
	</section>
{:else}
	<section>
		<h5>{$_('newDeposit')}</h5>
		<OperationForm bind:operation={deposit} recurringOperationText="isDepositRecurring" />
		<div class="buttons">
			<Button variant="strong" onclick={add} disabled={!formValid}
				><Checkmark size={24} />{$_('add')}</Button
			>
			<Button variant="secondary" onclick={cancel}><Undo size={24} />{$_('cancel')}</Button>
		</div>
	</section>
{/if}

{#if formErrors}
	<pre>{JSON.stringify(formErrors, null, 2)}</pre>
{/if}

<style>
	section {
		padding-bottom: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	section > h5 {
		color: var(--colors-ultraHigh, #303030);
		/* h5 */
		font-family: Arial;
		font-size: 1rem;
		font-style: normal;
		font-weight: 700;
		line-height: 1.5rem;
		letter-spacing: 0.02rem;
		padding-bottom: 1rem;
	}
	.buttons {
		display: flex;
		gap: 1rem;
	}
</style>
