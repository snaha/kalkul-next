import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const template = process.argv[2]
const subject = process.argv[3]
if (!template || !subject) {
	console.error('Usage: send-newsletter <template-name> <subject>')
}

const response = await fetch(
	`https://kalkul.app/api/email/preview?template=${template}&language=cs`,
)
if (!response.ok) {
	console.error({ response })
	process.exit(1)
}

const html = await response.text()

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
const sendResult = await resend.broadcasts.send(broadcastId)
if (sendResult.error) {
	console.error(sendResult.error)
	process.exit(1)
}

console.log({ data: sendResult.data })
