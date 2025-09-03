import { render } from 'svelte/server'
import { convert } from 'html-to-text'

export type TemplateProps = {
	origin: string
	template: string
	language: string
	unsubscribeLink: string
}

function cleanTextOutput(text: string): string {
	return (
		text
			// Remove Unicode directional marks and zero-width characters
			.replace(/[\u200E\u200F\u200B-\u200D\uFEFF\u202A-\u202E\u2060-\u2064]/g, '')
			// Convert non-breaking spaces to regular spaces
			.replace(/[\u00A0]/g, ' ')
			// Convert line/paragraph separators to newlines
			.replace(/[\u2028\u2029]/g, '\n')
			// Clean up excessive whitespace but preserve paragraph structure
			.replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single space
			.replace(/\n[ \t]+/g, '\n') // Remove spaces after newlines
			.replace(/[ \t]+\n/g, '\n') // Remove spaces before newlines
			.replace(/\n{3,}/g, '\n\n') // Limit to double line breaks maximum
			// Trim start and end
			.trim()
	)
}

type EmailTemplateResult =
	| {
			success: true
			html: string
			text: string
	  }
	| {
			success: false
			error: string
	  }

export async function renderEmailTemplate(
	component: unknown,
	props: TemplateProps,
): Promise<EmailTemplateResult> {
	try {
		// Use Svelte 5's server-side rendering API
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = render(component as any, { props })
		const rawHtml = result.body

		// Clean up HTML before conversion
		// const html = cleanHtmlForTextConversion(rawHtml);
		const html = rawHtml

		// Convert HTML to text using html-to-text with email-friendly options
		const rawText = convert(html, {
			wordwrap: false, // Disable automatic word wrapping to prevent awkward breaks
			preserveNewlines: false, // Let the converter handle newlines naturally
			selectors: [
				// Convert links to show both text and URL
				{ selector: 'a', options: { ignoreHref: false } },
				// Handle email-specific elements - skip problematic ones
				{ selector: 'style', format: 'skip' },
				{ selector: 'script', format: 'skip' },
				{ selector: 'head', format: 'skip' },
				{ selector: 'title', format: 'skip' },
				// Convert tables to simple text
				{ selector: 'table', options: { uppercaseHeaderCells: false } },
				// Add proper spacing for headings and paragraphs
				{ selector: 'h1', format: 'block' },
				{ selector: 'h2', format: 'block' },
				{ selector: 'h3', format: 'block' },
				{ selector: 'h4', format: 'block' },
				{ selector: 'h5', format: 'block' },
				{ selector: 'h6', format: 'block' },
				{ selector: 'p', format: 'block' },
			],
		})

		// Clean up the converted text output
		const text = cleanTextOutput(rawText)

		return {
			success: true,
			html,
			text,
		}
	} catch (error) {
		console.error('Email rendering error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}
