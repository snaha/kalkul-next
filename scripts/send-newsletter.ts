import { Resend } from 'resend'

// Check required environment variables
if (!process.env.RESEND_API_KEY) {
	console.error('Error: RESEND_API_KEY environment variable is required')
	process.exit(1)
}

if (!process.env.RESEND_AUDIENCE_ID) {
	console.error('Error: RESEND_AUDIENCE_ID environment variable is required')
	process.exit(1)
}

const resend = new Resend(process.env.RESEND_API_KEY)

const template = process.argv[2]
const subject = process.argv[3]
const scheduledAt = process.argv[4]
if (!template || !subject) {
	console.error('Usage: send-newsletter <template-name> <subject> [scheduled-at]')
	process.exit(1)
}

const response = await fetch(
	`https://kalkul.app/api/email/preview?template=${template}&language=cs`,
)
if (!response.ok) {
	console.error({ response })
	process.exit(1)
}

const html = await response.text()

// Check for unauthorized email addresses
const emailRegex = /\b[A-Za-z0-9._%+-]+@(?!kalkul\.app\b)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
const unauthorizedEmails = html.match(emailRegex)
if (unauthorizedEmails) {
	console.error(
		`Error: Newsletter contains unauthorized email addresses: ${unauthorizedEmails.join(', ')}`,
	)
	console.error('Only @kalkul.app email addresses are allowed in newsletters')
	process.exit(1)
}

const createResult = await resend.broadcasts.create({
	audienceId: process.env.RESEND_AUDIENCE_ID,
	from: 'Kalkul <team@kalkul.app>',
	subject,
	html,
	name: subject,
})

if (createResult.error) {
	console.error(createResult.error)
	process.exit(1)
}

const broadcastId = createResult.data.id
const sendOptions = scheduledAt ? { scheduledAt } : undefined
const sendResult = await resend.broadcasts.send(broadcastId, sendOptions)
if (sendResult.error) {
	console.error(sendResult.error)
	process.exit(1)
}

console.log({ data: sendResult.data })
