<script lang="ts">
	import { Text, Heading, styleToString, Button } from 'svelte-email'
	import EmailLayout from '../components/email-layout.svelte'
	import EmailHeader from '../components/email-header.svelte'
	import Section from '../components/section.svelte'
	import { LAYOUT_STYLES, TYPOGRAPHY_STYLES, LINK_STYLES } from '../utils/constants'
	import EmailFooter from '../components/email-footer.svelte'
	import Container from '../components/container.svelte'
	import { _ } from 'svelte-i18n'
	import EmailCard from '../components/email-card.svelte'
	import routes from '$lib/routes'
	import type { TemplateProps } from '../utils/render'

	let { origin = 'http://kalkul.app', template, language }: TemplateProps = $props()

	const viewLink = $derived(`${origin}${routes.EMAIL}?template=${template}&language=${language}`)
</script>

<EmailLayout
	title={$_('email.templates.welcome.subject')}
	previewText={$_('email.templates.welcome.previewText')}
>
	<EmailCard {viewLink}>
		<!-- Header -->
		<EmailHeader />

		<!-- Main heading with rocket emoji -->
		<Heading style={TYPOGRAPHY_STYLES.mainHeading}>
			{$_('email.templates.welcome.title')}
		</Heading>

		<Text style={TYPOGRAPHY_STYLES.introText}>
			{$_('email.templates.welcome.introText')}
		</Text>

		<!-- Collaboration illustration placeholder -->
		<Section style={LAYOUT_STYLES.illustrationSection}>
			<img
				src="https://kalkul.app/images/email/work-being-creative.png"
				alt={$_('email.templates.welcome.expertiseHeading')}
				width="200"
				height="200"
			/>
		</Section>

		<!-- Your expertise matters section -->
		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}
			>{$_('email.templates.welcome.expertiseHeading')}</Heading
		>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			{$_('email.templates.welcome.expertiseText')}
		</Text>

		<!-- Rewards illustration placeholder -->
		<Section style={LAYOUT_STYLES.illustrationSection}>
			<img
				src="https://kalkul.app/images/email/add-to-wishlist.png"
				alt={$_('email.templates.welcome.rewardsHeading')}
				width="200"
				height="200"
			/>
		</Section>

		<!-- Exclusive rewards section -->
		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}
			>{$_('email.templates.welcome.rewardsHeading')}</Heading
		>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			{$_('email.templates.welcome.rewardsText')}
		</Text>

		<!-- Get started section -->
		<Section style={LAYOUT_STYLES.illustrationSection}>
			<img
				src="https://kalkul.app/images/email/lets-start.png"
				alt={$_('email.templates.welcome.getStartedHeading')}
				width="200"
				height="200"
			/>
		</Section>

		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}
			>{$_('email.templates.welcome.getStartedHeading')}</Heading
		>

		<Text style={TYPOGRAPHY_STYLES.listText}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			1. {@html $_('email.templates.welcome.step1', {
				values: {
					loginUrl: `<a href="${origin}${routes.LOGIN}" style="${styleToString(LINK_STYLES.primary)}">kalkul.app/login</a>`,
				},
			})}
		</Text>

		<Text style={TYPOGRAPHY_STYLES.listText}>
			2. {$_('email.templates.welcome.step2')}
		</Text>

		<Text style={TYPOGRAPHY_STYLES.listText}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			3. {@html $_('email.templates.welcome.step3', {
				values: {
					discordLink: `<a href="${origin}${routes.DISCORD}" style="${styleToString(LINK_STYLES.primary)}">Discord</a>`,
				},
			})}
		</Text>

		<Section style={LAYOUT_STYLES.buttonSection}>
			<Container>
				<Button href={`${origin}${routes.DISCORD}`} style={LAYOUT_STYLES.buttonContainer}
					>{$_('email.templates.welcome.discordButton')}</Button
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

		<Text style={TYPOGRAPHY_STYLES.bodyTextCentered}>{$_('email.templates.welcome.thankYou')}</Text>
	</EmailCard>
	<EmailFooter>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html $_('email.common.footerText', {
			values: {
				supportEmail: `<a href="mailto:support@kalkul.app" style="${styleToString(LINK_STYLES.secondary)}">support@kalkul.app</a>`,
			},
		})}
	</EmailFooter>
</EmailLayout>
