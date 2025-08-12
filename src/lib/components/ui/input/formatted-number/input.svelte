<script lang="ts">
	import Input from '../input.svelte'
	import type { Props as InputProps } from '../input.svelte'
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { DEFAULT_MAXIMUM_FRACTION_DIGITS } from './logic'
	import { withInputStore } from './store.svelte'
	import {
		createFocusHandler,
		createBlurHandler,
		createKeyDownHandler,
		createPasteHandler,
		createInputHandler,
		createEventHandlerState,
	} from './events'

	type Props = Omit<InputProps & HTMLInputAttributes, 'type' | 'value'> & {
		value?: number
		min?: number
		max?: number
		step?: number
		maximumFractionDigits?: number
		locale: string | null | undefined
	}

	let {
		value = $bindable(),
		min,
		max,
		maximumFractionDigits = DEFAULT_MAXIMUM_FRACTION_DIGITS,
		locale,
		placeholder = '0',
		...restProps
	}: Props = $props()

	let inputElement = $state<HTMLInputElement>()

	// Create store instance for this input
	const store = withInputStore(value)

	// Create event handler state for this input
	const eventState = createEventHandlerState()

	// Sync store value with bound prop
	$effect(() => {
		if (store.value !== value) {
			value = store.value
		}
	})

	// Update display value when value prop changes from outside
	$effect(() => {
		store.updateDisplayValue(value, locale, { maximumFractionDigits })
	})

	// Shared config object for all event handlers
	const config = $derived({
		store,
		locale: locale,
		formatOptions: { maximumFractionDigits },
		constraints: { min, max },
	})

	// Helper functions for event handlers
	const getInputElement = () => inputElement
	const setDisplayValue = (newValue: string) => {
		store.setDisplayValue(newValue)
	}

	// Create event handlers using shared config
	const handleFocus = createFocusHandler(store, getInputElement)
	const handleBlur = () => createBlurHandler(config)()
	const handleKeyDown = (event: KeyboardEvent) =>
		createKeyDownHandler(config, getInputElement, setDisplayValue)(event)
	const handlePaste = (event: ClipboardEvent) =>
		createPasteHandler(config, eventState, getInputElement, setDisplayValue)(event)
	const handleInput = (event: Event) =>
		createInputHandler(config, eventState, getInputElement, setDisplayValue)(event)

	// Reactive display value from store
	let displayValue = $state(store.displayValue)
	$effect(() => {
		displayValue = store.displayValue
	})
</script>

<Input
	type="text"
	inputmode="decimal"
	bind:value={displayValue}
	bind:input={inputElement}
	onfocus={handleFocus}
	onblur={handleBlur}
	oninput={handleInput}
	onkeydown={handleKeyDown}
	onpaste={handlePaste}
	{placeholder}
	{...restProps}
/>
