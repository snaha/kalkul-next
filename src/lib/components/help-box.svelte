<script lang="ts">
	import { ChatBot, Close, ShrinkScreenFilled } from 'carbon-icons-svelte'
	import Vertical from './ui/vertical.svelte'
	import { type Snippet } from 'svelte'
	import Button from './ui/button.svelte'
	import Horizontal from './ui/horizontal.svelte'
	import Expander from './expander.svelte'
	import Typography from './ui/typography.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import { PUBLIC_DISCORD_LINK } from '$env/static/public'
	import { _ } from 'svelte-i18n'

	type Props = {
		title?: string
		boxText?: string
		text?: string
		children?: Snippet
		open: boolean
		closeButton?: boolean
		onclose?: () => void
	}

	let { children, open = $bindable(), title, boxText, text, closeButton, onclose }: Props = $props()
</script>

<Vertical class="help-box" --vertical-gap="0">
	<Expander expanded={open} horizontal vertical>
		<div class="content">
			<Vertical --vertical-gap="var(--padding)">
				{#if title || closeButton}
					<Horizontal>
						{#if title}
							<ChatBot size={24} />
							<Typography variant="h5">{title}</Typography>
						{/if}
						{#if closeButton}
							<FlexItem />
							<Button variant="ghost" dimension="small" onclick={onclose}>
								<Close size={16} />
							</Button>
						{/if}
					</Horizontal>
				{/if}
				{#if boxText}
					<Horizontal class="help-box-green help-box-box" --padding-left="var(--half-padding)">
						<Typography variant="h5" --typography-color="var(--colors-high)">
							{boxText}</Typography
						>
					</Horizontal>
				{/if}
				{#if text}
					<Typography>{text}</Typography>
				{/if}

				{#if children}
					{@render children()}
				{/if}

				<Horizontal class="bg-ultra-low" style="padding: var(--half-padding)">
					<Typography variant="small">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html $_('page.home.helpText', {
							values: {
								discordCommunityLink: `<a href="${PUBLIC_DISCORD_LINK}">${$_('page.home.discordCommunity')}</a>`,
								supportEmail: `<a href="mailto:support@kalkul.app">support@kalkul.app</a>`,
							},
						})}
					</Typography>
				</Horizontal>
			</Vertical>
		</div>
	</Expander>
	<Horizontal --horizontal-justify-content="end">
		<Button variant="ghost" dimension="compact" onclick={() => (open = !open)}>
			{#if open}
				<ShrinkScreenFilled size={24} />
			{:else}
				<ChatBot size={24} />
			{/if}
		</Button>
	</Horizontal>
</Vertical>

<style>
	:global(.help-box) {
		padding: var(--padding);
		background-color: var(--colors-base);
		border-radius: var(--padding);
		box-shadow: 0px 1px 8px 0px #00000040;
		position: fixed;
		bottom: var(--padding);
		right: var(--padding);
	}
	.content {
		padding: 0;
		padding-bottom: var(--padding);
		width: 328px;
	}
	:global(.help-box-green) {
		background-color: color-mix(in srgb, var(--colors-high) 10%, transparent);
		color: var(--colors-high);
	}
	:global(.help-box-box) {
		border-radius: var(--half-padding);
		padding: var(--half-padding);
		gap: 10px;
	}
</style>
