import { Resend } from 'resend'
import { readFileSync } from 'fs'

// The total number of recipients cannot exceed 50 (including the `to` recipient)
const RESEND_MAX_EMAIL_PER_BATCH = 50 - 1

// Check required environment variables
if (!process.env.RESEND_API_KEY) {
	console.error('Error: RESEND_API_KEY environment variable is required')
	process.exit(1)
}

const resend = new Resend(process.env.RESEND_API_KEY)

const template = process.argv[2]
const subject = process.argv[3]
/*
 * The batch file is a CSV file exported from Supabase with the following query
 * `SELECT email FROM auth.users`
 *
 * The first line is the title of the column (e.g. `email`) and the rest of the file
 * is the emails of the users, one email per line
 */
const batchFile = process.argv[4]
if (!template || !subject || !batchFile) {
	console.error('Usage: send-email <template-name> <subject> <batch-file-csv>')
	process.exit(1)
}

const response = await fetch(
	`http://localhost:5173/api/email/preview?template=${template}&language=cs`,
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

const fileContent = readFileSync(batchFile, { encoding: 'utf-8' })
const emails = fileContent
	.split('\n')
	.slice(1)
	.map((line) => line.trim())
	.filter((line) => line !== '')

const emailCount = emails.length

while (emails.length > 0) {
	const batchOfEmails = emails.slice(0, RESEND_MAX_EMAIL_PER_BATCH)

	// mutate the emails array
	emails.splice(0, RESEND_MAX_EMAIL_PER_BATCH)

	console.log(
		`Sending ${batchOfEmails.length} emails, first: ${batchOfEmails[0]}, last: ${batchOfEmails.slice(-1)[0]}`,
	)
	const batchSendResult = await resend.batch.send([
		{
			from: 'Kalkul <team@kalkul.app>',
			to: 'Kalkul <team@kalkul.app>',
			subject,
			html,
			bcc: batchOfEmails,
		},
	])

	if (batchSendResult.error) {
		console.error(batchSendResult.error)
		process.exit(1)
	}
}

console.log(`Sent ${emailCount} emails succesfully`)
