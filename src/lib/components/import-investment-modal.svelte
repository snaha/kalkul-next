<script lang="ts">
	import ImportInvestment from './import-investment.svelte'
	import Modal, { type ModalProps } from './ui/modal.svelte'

	type Props = {
		name: string
		type: string
		apy: number | undefined
		currency: string
	}

	let {
		name = $bindable(),
		type = $bindable(),
		apy = $bindable(),
		currency,
		oncancel,
		open = $bindable(),
		...restProps
	}: ModalProps & Props = $props()
</script>

<Modal {oncancel} bind:open {...restProps}>
	<ImportInvestment bind:name bind:type bind:apy bind:open {currency} />
</Modal>
