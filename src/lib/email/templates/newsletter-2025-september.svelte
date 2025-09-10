<script lang="ts">
	import { Heading, Button, Text } from 'svelte-email'
	import Section from '../components/section.svelte'
	import Container from '../components/container.svelte'
	import { _ } from 'svelte-i18n'
	import EmailCard from '../components/email-card.svelte'
	import EmailFooter from '../components/email-footer.svelte'
	import EmailHeader from '../components/email-header.svelte'
	import EmailLayout from '../components/email-layout.svelte'
	import { TYPOGRAPHY_STYLES, LAYOUT_STYLES } from '../utils/constants'
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
				<Button
					href={`mailto:support@kalkul.app?subject=${$_('email.templates.newsletter2025September.kalkulDemoRequest')}&body=${$_('email.templates.newsletter2025September.kalkulDemoRequestBody')}`}
					style={LAYOUT_STYLES.secondaryButtonContainer}
					>{$_('email.templates.newsletter2025September.requestDemoButton')}</Button
				>
			</Container>
		</Section>

		<Section>
			<Text style={TYPOGRAPHY_STYLES.bodyText}>
				{$_('email.templates.newsletter2025September.bodyText1')}
			</Text>

			<Text style={TYPOGRAPHY_STYLES.quoteText}>
				"{$_('email.templates.newsletter2025September.quoteText')}"
			</Text>

			<Text style={TYPOGRAPHY_STYLES.bodyText}>
				{$_('email.templates.newsletter2025September.bodyText2')}
			</Text>
		</Section>

		<Text style={TYPOGRAPHY_STYLES.bodyTextCentered}>
			{$_('email.templates.newsletter2025September.closingText')}
			<br />{$_('email.templates.newsletter2025September.teamText')}
		</Text>
	</EmailCard>
	<EmailFooter {unsubscribeLink}></EmailFooter>
</EmailLayout>
