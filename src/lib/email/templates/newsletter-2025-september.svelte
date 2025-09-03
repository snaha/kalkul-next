<script lang="ts">
	import { Heading, styleToString, Button, Text } from 'svelte-email'
	import Section from '../components/section.svelte'
	import Container from '../components/container.svelte'
	import { _ } from 'svelte-i18n'
	import EmailCard from '../components/email-card.svelte'
	import EmailFooter from '../components/email-footer.svelte'
	import EmailHeader from '../components/email-header.svelte'
	import EmailLayout from '../components/email-layout.svelte'
	import { TYPOGRAPHY_STYLES, LAYOUT_STYLES, LINK_STYLES } from '../utils/constants'
	import routes from '$lib/routes'
	import type { TemplateProps } from '../utils/render'

	let {
		origin = 'http://kalkul.app',
		template,
		language,
		unsubscribeLink,
	}: TemplateProps = $props()

	const viewLink = $derived(
		`${origin}${routes.EMAIL}?template=${template}&language=${language}&unsubscribe=${unsubscribeLink}`,
	)
</script>

<EmailLayout
	title={$_('email.templates.newsletter2025September.subject')}
	previewText={$_('email.templates.newsletter2025September.previewText')}
>
	<EmailCard {viewLink}>
		<!-- Header -->
		<EmailHeader />

		<!-- Main heading with rocket emoji -->
		<Heading style={TYPOGRAPHY_STYLES.mainHeading}>
			{$_('email.templates.newsletter2025September.title')}
		</Heading>

		<Text style={TYPOGRAPHY_STYLES.introText}>
			{$_('email.templates.newsletter2025September.introText')}
		</Text>

		<!-- Collaboration illustration placeholder -->
		<Section style={LAYOUT_STYLES.illustrationSection}>
			<img
				src={`${origin}/images/email/interface-welcome.png`}
				alt={$_('email.templates.newsletter2025September.betaSignupHeading')}
				width="200"
				height="200"
			/>
		</Section>

		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}
			>{$_('email.templates.newsletter2025September.betaSignupHeading')}</Heading
		>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			{$_('email.templates.newsletter2025September.betaSignupText')}
		</Text>

		<Section style={LAYOUT_STYLES.buttonSection}>
			<Container>
				<Button href={origin} style={LAYOUT_STYLES.buttonContainer}
					>{$_('email.templates.newsletter2025September.signupButton')}</Button
				>
			</Container>
		</Section>

		<!-- Your expertise matters section -->
		<!-- Collaboration illustration placeholder -->
		<Section style={LAYOUT_STYLES.illustrationSection}>
			<img
				src={`${origin}/images/email/work-being-creative.png`}
				alt={$_('email.templates.newsletter2025September.expertiseHeading')}
				width="200"
				height="200"
			/>
		</Section>

		<!-- Your expertise matters section -->
		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}
			>{$_('email.templates.newsletter2025September.expertiseHeading')}</Heading
		>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			{$_('email.templates.newsletter2025September.expertiseText')}
		</Text>

		<Section style={LAYOUT_STYLES.buttonSection}>
			<Container>
				<Button href={`${origin}${routes.DISCORD}`} style={LAYOUT_STYLES.buttonContainer}
					>{$_('email.templates.newsletter2025September.discordButton')}</Button
				>
			</Container>
		</Section>

		<Text style={TYPOGRAPHY_STYLES.footerTextLast}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $_('email.common.contactSupport', {
				values: {
					supportEmail: `<a href="mailto:support@kalkul.app" style="${styleToString(LINK_STYLES.secondary)}">support@kalkul.app</a>`,
				},
			})}
		</Text>

		<!-- Import illustration placeholder -->
		<Section style={LAYOUT_STYLES.illustrationSection}>
			<img
				src={`${origin}/images/email/screenshot-2025-september.png`}
				alt={$_('email.templates.newsletter2025September.importDataAlt')}
				width="560"
				height="472"
			/>
		</Section>

		<!-- Import investment data section -->
		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}
			>{$_('email.templates.newsletter2025September.importDataHeading')}</Heading
		>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			{$_('email.templates.newsletter2025September.importDataText')}
		</Text>

		<Section style={LAYOUT_STYLES.buttonSection}>
			<Container>
				<Button href={origin} style={LAYOUT_STYLES.buttonContainer}
					>{$_('email.templates.newsletter2025September.tryItButton')}</Button
				>
			</Container>
		</Section>

		<Text style={TYPOGRAPHY_STYLES.bodyTextCentered}>
			{$_('email.templates.newsletter2025September.closingText')}
			<br />
			{$_('email.templates.newsletter2025September.thanksText')}
		</Text>
	</EmailCard>
	<EmailFooter {unsubscribeLink}></EmailFooter>
</EmailLayout>
