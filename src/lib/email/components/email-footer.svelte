<script lang="ts">
	import { TYPOGRAPHY_STYLES, LINK_STYLES, LAYOUT_STYLES } from '../utils/constants'
	import { Text, styleToString } from 'svelte-email'
	import Container from './container.svelte'
	import Section from './section.svelte'
	import { _ } from 'svelte-i18n'
	import type { Snippet } from 'svelte'

	type Props = {
		unsubscribeLink?: string
		children?: Snippet
	}

	let { unsubscribeLink = undefined, children = undefined }: Props = $props()
</script>

<Section style={LAYOUT_STYLES.footerContainer}>
	<Container>
		<!-- Footer -->
		<Text style={TYPOGRAPHY_STYLES.footerText}>
			{#if children}
				{@render children()}
				<br />
				<br />
			{/if}
			{$_('email.common.companyName')}
			<br />
			{$_('email.common.companyAddress')}
			<br />
			{#if unsubscribeLink}
				<br />
				<a href={unsubscribeLink} style={styleToString(LINK_STYLES.secondary)}
					>{$_('email.common.unsubscribe')}</a
				>
			{/if}
		</Text>
	</Container>
</Section>
