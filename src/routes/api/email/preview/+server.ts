import { json, type RequestHandler } from '@sveltejs/kit'
import { renderEmailTemplate, type TemplateProps } from '$lib/email/utils/render'
import WelcomeEmail from '$lib/email/templates/welcome-email.svelte'
import { init, register } from 'svelte-i18n'
import Newsletter_2025September from '$lib/email/templates/newsletter-2025-september.svelte'
import FollowupEmail_2025September from '$lib/email/templates/followup-2025-october.svelte'
import { UNSUBSCRIBE_LINK_PLACEHOLDER } from '$lib/email/utils/constants'

async function renderTemplate(name: string, templateProps: TemplateProps) {
	switch (name) {
		case 'welcome':
			return await renderEmailTemplate(WelcomeEmail, templateProps)
		case 'newsletter-2025-september':
			return await renderEmailTemplate(Newsletter_2025September, templateProps)
		case 'followup-2025-october':
			return await renderEmailTemplate(FollowupEmail_2025September, templateProps)
		default:
			return
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const origin = 'https://kalkul.app'
	const template = url.searchParams.get('template') || 'welcome'
	const language = url.searchParams.get('language') || 'en' // Default to English for preview
	const format = url.searchParams.get('format') || 'html' // html or text
	const unsubscribeLink = url.searchParams.get('unsubscribe') || UNSUBSCRIBE_LINK_PLACEHOLDER

	// Register translations and initialize i18n for server-side rendering
	register('en', () => import('$lib/locales/en.json'))
	register('cs', () => import('$lib/locales/cs.json'))

	await init({
		fallbackLocale: 'en',
		initialLocale: language,
	})

	try {
		const templateProps = {
			origin,
			template,
			language,
			unsubscribeLink,
		}

		const renderResult = await renderTemplate(template, templateProps)
		if (!renderResult) {
			return json({ error: 'Template not found' }, { status: 404 })
		}

		if (!renderResult.success) {
			return json({ error: renderResult.error }, { status: 500 })
		}

		// Return format based on query parameter
		if (format === 'text') {
			return new Response(renderResult.text, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
				},
			})
		} else if (format === 'json') {
			return json({
				html: renderResult.html,
				text: renderResult.text,
			})
		} else {
			// Default to HTML for direct browser viewing
			const html = renderResult.html.replace('{{{RESEND_UNSUBSCRIBE_URL}}}', unsubscribeLink)
			return new Response(html, {
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
				},
			})
		}
	} catch (error) {
		console.error('Email preview error:', error)
		return json({ error: 'Failed to render email template' }, { status: 500 })
	}
}
