<script lang="ts" context="module">
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'
	type Variant = 'strong' | 'secondary' | 'ghost' | 'solid' | 'darkoverlay' | 'lightoverlay'
	type Dimension = 'default' | 'large' | 'compact' | 'small'
	type ButtonProps = {
		variant?: Variant
		active?: boolean
		hover?: boolean
		focus?: boolean
		dimension?: Dimension
	}
	interface AnchorElement extends HTMLAnchorAttributes, ButtonProps {
		href?: HTMLAnchorAttributes['href']
		type?: never
		disabled?: boolean
	}

	interface ButtonElement extends HTMLButtonAttributes, ButtonProps {
		type?: HTMLButtonAttributes['type']
		href?: never
		disabled?: boolean
	}
	export type Props = AnchorElement | ButtonElement
</script>

<script lang="ts">
	let {
		dimension = 'default',
		variant = 'strong',
		active,
		hover,
		focus,
		disabled,
		href,
		class: className = '',
		children,
		...restProps
	}: Props = $props()
</script>

<span class={`root ${className}`} class:disabled>
	<svelte:element
		this={href ? 'a' : 'button'}
		class={`${dimension} ${variant}`}
		class:active
		class:hover
		class:focus
		{href}
		{disabled}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</svelte:element>
</span>

<style lang="postcss">
	.root {
		display: inline-flex;
		flex-grow: 0;
		flex-direction: row;
		justify-content: stretch;
		align-items: stretch;

		&.disabled {
			opacity: 0.25;
			cursor: not-allowed;

			a,
			button {
				pointer-events: none;
			}
		}
	}
	button,
	a {
		display: inline-flex;
		flex-grow: 1;
		flex-shrink: 0;
		justify-content: left;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		border: 1px solid var(--colors-ultra-high);
		border-radius: var(--border-radius);
		font-style: normal;
		font-weight: 400;
		font-family: var(--font-family-sans-serif);
		text-decoration: none;
		white-space: nowrap;
	}
	.default {
		padding: var(--three-quarters-padding);
		min-width: 3rem;
		font-size: var(--font-size);
		line-height: var(--line-height);
		letter-spacing: var(--letter-spacing);
	}
	.large {
		padding: var(--three-quarters-padding);
		min-width: 3.5rem;
		font-size: var(--font-size-large);
		line-height: var(--line-height-large);
		letter-spacing: var(--letter-spacing-large);
	}
	.compact {
		padding: var(--half-padding);
		min-width: 2.5rem;
		font-size: var(--font-size);
		line-height: var(--line-height);
		letter-spacing: var(--letter-spacing);
	}
	.small {
		gap: 0.25rem;
		padding: var(--half-padding);
		min-width: 2rem;
		font-size: var(--font-size-small);
		line-height: var(--line-height-small);
		letter-spacing: var(--letter-spacing-small);
	}

	.strong {
		border: 1px solid transparent;
		background: var(--colors-ultra-high);
		color: var(--colors-ultra-low);

		&:focus-visible:not(:disabled),
		&.focus:not(:disabled) {
			outline: var(--focus-outline);
			outline-offset: var(--focus-outline-offset);
			background: var(--colors-base);
			color: var(--colors-top);
		}

		&:focus-visible:not(:disabled):active,
		&.focus:not(:disabled).active {
			outline: none;
			background: var(--colors-top);
			color: var(--colors-base);
		}

		&:hover:not(:disabled),
		&.hover:not(:disabled) {
			background: var(--colors-high);
			color: var(--colors-base);
		}

		&:active:not(:disabled),
		&.active:not(:disabled) {
			background: var(--colors-top);
			color: var(--colors-base);
		}
	}
	.secondary {
		border: 1px solid var(--colors-ultra-high);
		background: none;
		color: var(--colors-ultra-high);

		&:focus-visible:not(:disabled),
		&.focus:not(:disabled) {
			outline: var(--focus-outline);
			outline-offset: var(--focus-outline-offset);
			border: 1px solid transparent;
			background: var(--colors-base);
			color: var(--colors-top);
		}

		&:focus-visible:not(:disabled):active,
		&.focus:not(:disabled).active {
			outline: none;
			background: var(--colors-top);
			color: var(--colors-base);
		}

		&:hover:not(:disabled),
		&.hover:not(:disabled) {
			border: 1px solid var(--colors-high);
			background: var(--colors-low);
			color: var(--colors-high);
		}

		&:active:not(:disabled),
		&.active:not(:disabled) {
			border: 1px solid var(--colors-top);
			background: var(--colors-low);
			color: var(--colors-top);
		}
	}
	.ghost {
		border: 1px solid transparent;
		background: transparent;
		color: var(--colors-ultra-high);

		&:focus-visible:not(:disabled),
		&.focus:not(:disabled) {
			outline: var(--focus-outline);
			outline-offset: var(--focus-outline-offset);
			background: var(--colors-base);
			color: var(--colors-top);
		}

		&:focus-visible:not(:disabled):active,
		&.focus:not(:disabled).active {
			outline: none;
			background: var(--colors-top);
			color: var(--colors-base);
		}

		&:hover:not(:disabled),
		&.hover:not(:disabled) {
			background: var(--colors-low);
			color: var(--colors-high);
		}

		&:active:not(:disabled),
		&.active:not(:disabled) {
			background: var(--colors-low);
			color: var(--colors-top);
		}
	}
	.solid {
		border: 1px solid var(--colors-low);
		background: var(--colors-base);
		color: var(--colors-ultra-high);

		&:focus-visible:not(:disabled),
		&.focus:not(:disabled) {
			outline: var(--focus-outline);
			outline-offset: var(--focus-outline-offset);
			background: var(--colors-base);
			color: var(--colors-top);
		}

		&:focus-visible:not(:disabled):active,
		&.focus:not(:disabled).active {
			outline: none;
			background: var(--colors-top);
			color: var(--colors-base);
		}

		&:hover:not(:disabled),
		&.hover:not(:disabled) {
			background: var(--colors-low);
			color: var(--colors-high);
		}

		&:active:not(:disabled),
		&.active:not(:disabled) {
			background: var(--colors-low);
			color: var(--colors-top);
		}
	}
	.darkoverlay {
		border: 1px solid transparent;
		background: var(--colors-dark-overlay);
		color: var(--colors-dark-top);

		&:focus-visible:not(:disabled),
		&.focus:not(:disabled) {
			outline: var(--focus-outline);
			outline-offset: var(--focus-outline-offset);
			background: var(--colors-base);
			color: var(--colors-top);
		}

		&:focus-visible:not(:disabled):active,
		&.focus:not(:disabled).active {
			outline: none;
			background: var(--colors-top);
			color: var(--colors-base);
		}

		&:hover:not(:disabled),
		&.hover:not(:disabled) {
			background: var(--colors-dark-base);
			color: var(--colors-dark-top);
		}

		&:active:not(:disabled),
		&.active:not(:disabled) {
			background: var(--colors-dark-base);
			color: var(--colors-dark-top);
		}
	}

	.lightoverlay {
		border: 1px solid transparent;
		background: var(--colors-light-overlay);
		color: var(--colors-light-top);

		&:focus-visible:not(:disabled),
		&.focus:not(:disabled) {
			outline: var(--focus-outline);
			outline-offset: var(--focus-outline-offset);
			background: var(--colors-base);
			color: var(--colors-top);
		}

		&:focus-visible:not(:disabled):active,
		&.focus:not(:disabled).active {
			outline: none;
			background: var(--colors-top);
			color: var(--colors-base);
		}

		&:hover:not(:disabled),
		&.hover:not(:disabled) {
			background: var(--colors-light-base);
			color: var(--colors-light-top);
		}

		&:active:not(:disabled),
		&.active:not(:disabled) {
			background: var(--colors-light-base);
			color: var(--colors-light-top);
		}
	}
</style>
