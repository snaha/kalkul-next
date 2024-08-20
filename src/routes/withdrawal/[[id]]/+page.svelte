<script lang="ts">
	import { page } from '$app/stores'
	import { get } from 'svelte/store'
	import type { WithdrawalForm } from '$lib/types'
	import { detailStore } from '$lib/stores/details.svelte'
	import { goto } from '$app/navigation'
	import { initializeForm, isInt } from '$lib/utils'
	import routes from '$lib/routes'
	import { depositWithdrawalFormSchema, depositWithdrawalSchema } from '$lib/schemas'
	import type { ZodError } from 'zod'
	import { _ } from 'svelte-i18n'
	import Button from '$lib/components/button.svelte'
	import { Checkmark, TrashCan, Undo } from 'carbon-icons-svelte'
	import PageOfOperation from '$lib/components/operation-form.svelte'

	const index = get(page).params.id
	const withdrawalIndex = isInt(index) ? Number.parseInt(index) : undefined

	let withdrawal = $state<WithdrawalForm>(initializeForm(detailStore.withdrawals, withdrawalIndex))
	let formValid = $state(false)
	let formErrors: ZodError | undefined = $state()

	$effect(() => {
		const res = depositWithdrawalFormSchema.safeParse(withdrawal)
		if (res.success) {
			formErrors = undefined
			formValid = true
		} else {
			formErrors = res.error
			formValid = false
		}
	})

	function save() {
		if (withdrawalIndex !== undefined) {
			const res = depositWithdrawalSchema.safeParse(withdrawal)
			if (res.success) {
				detailStore.saveWithdrawal(withdrawalIndex, res.data)
				goto(routes.HOME)
			}
		}
	}

	function deleteWithdrawal() {
		if (withdrawalIndex !== undefined) {
			detailStore.removeWithdrawal(withdrawalIndex)
			goto(routes.HOME)
		}
	}

	function cancel() {
		goto(routes.HOME)
	}

	function add() {
		const res = depositWithdrawalSchema.safeParse(withdrawal)
		if (res.success) {
			detailStore.addWithdrawal(res.data)
			goto(routes.HOME)
		}
	}
</script>

{#if (withdrawalIndex === undefined && Boolean(index)) || (withdrawalIndex !== undefined && detailStore.withdrawals.length <= withdrawalIndex)}
	<section>
		<h5>Výběr s indexem {index} jsme nenalezli</h5>
		<Button variant="secondary" onclick={cancel}><Undo size={24} /></Button>
	</section>
{:else if withdrawalIndex !== undefined}
	<section>
		<h5>{$_('editedWithdrawal')} #{withdrawalIndex} - "{withdrawal.name}"</h5>
		<PageOfOperation bind:operation={withdrawal} recurringOperationText="isWithdrawalRecurring" />
		<div class="buttons">
			<Button variant="strong" onclick={save} disabled={!formValid}
				><Checkmark size={24} />{$_('save')}</Button
			>
			<Button variant="secondary" onclick={deleteWithdrawal} disabled={!formValid}
				><TrashCan size={24} />{$_('delete')}</Button
			>
			<Button variant="secondary" onclick={cancel}><Undo size={24} />{$_('cancel')}</Button>
		</div>
	</section>
{:else}
	<section>
		<h5>{$_('newWithdrawal')}</h5>
		<PageOfOperation bind:operation={withdrawal} recurringOperationText="isWithdrawalRecurring" />
		<div class="buttons">
			<Button variant="strong" onclick={add} disabled={!formValid}>
				<Checkmark size={24} />{$_('add')}
			</Button>
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
