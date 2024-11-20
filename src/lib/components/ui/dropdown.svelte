<script lang="ts">
	import type { Snippet } from 'svelte'
	import Button, { type Variant, type Dimension } from '$lib/components/ui/button.svelte'

	type Props = {
		disabled?: boolean
		up?: boolean
		left?: boolean
		button: Snippet
		children: Snippet
		buttonVariant?: Variant
		buttonDimension?: Dimension
		autoClose?: boolean
	}

	let {
		disabled = false,
		up = false,
		left = false,
		button,
		children,
		buttonVariant = 'ghost',
		buttonDimension = 'default',
		autoClose = true,
	}: Props = $props()

	let showDropdown = $state(false)
	let dropdownElement: HTMLElement
	let dropdownMenu: HTMLElement
	let dropdownId: string

	function close(ev: MouseEvent) {
		const target = ev.target as unknown as Node
		if (dropdownElement.contains(target)) {
			// Clicked on the dropdown button or inside the dropdown
			if (dropdownMenu.contains(target) && autoClose) {
				showDropdown = false
			}
		} else {
			// Clicked outside the dropdown
			showDropdown = false
		}
	}

	function onKeyUp(ev: KeyboardEvent) {
		if (ev.key === 'Escape') {
			showDropdown = false
		}
	}

	$effect(() => {
		window.addEventListener('click', close)
		window.addEventListener('keyup', onKeyUp)

		return () => {
			window.removeEventListener('click', close)
			window.removeEventListener('keyup', onKeyUp)
		}
	})

	function onClick(e: MouseEvent) {
		if (!disabled) showDropdown = !showDropdown
		e.preventDefault()
	}
</script>

<div
	bind:this={dropdownElement}
	class="dropdown"
	role="combobox"
	aria-haspopup="listbox"
	aria-expanded={showDropdown}
	aria-controls={dropdownId}
	tabindex={-1}
>
	<Button
		onclick={onClick}
		style="max-width:320px;"
		variant={buttonVariant}
		dimension={buttonDimension}
		active={showDropdown}>{@render button()}</Button
	>

	<div class={`root`} aria-hidden={!showDropdown}>
		<div
			bind:this={dropdownMenu}
			class:hidden={!showDropdown}
			class:up
			class:left
			id={dropdownId}
			role="listbox"
			aria-labelledby="dropdown-button"
			tabindex={-1}
		>
			{@render children()}
		</div>
	</div>
</div>

<style lang="postcss">
	.root {
		position: relative;

		div {
			position: absolute;
			z-index: 1;
			border-radius: var(--border-radius);
			width: max-content;
			max-width: 450px;

			&.hidden {
				display: none;
			}

			&.up {
				inset: auto 0 50px auto;
			}

			&.left {
				top: 4px;
				right: 0;
				bottom: auto;
				left: auto;
			}
		}
	}
</style>
