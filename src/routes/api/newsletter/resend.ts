import { RESEND_API_KEY } from '$env/static/private'
import { asyncTimeout } from '$lib/utils'
import {
	Resend,
	type CreateContactOptions,
	type ErrorResponse,
	type GetContactOptions,
	type UpdateContactOptions,
} from 'resend'

export const resend = new Resend(RESEND_API_KEY)

/**
 * resend.com API has a rate limit of 2 requests per second
 *
 * See here for more information: https://resend.com/changelog/api-rate-limit
 *
 */

type RetryOptions = {
	retries?: number
}

type ResendResponseBase = {
	error: ErrorResponse | null
}

async function retryWithExponentialBackoff<T extends ResendResponseBase>(
	func: () => Promise<T>,
	{ retries = 3 }: RetryOptions = {},
): Promise<T | never> {
	let randomBase = 500
	for (let attempts = 0; attempts < retries; attempts++) {
		const response = await func()
		if (!response.error) {
			return response
		}
		if (response.error.name === 'rate_limit_exceeded') {
			const randomTimeout = randomBase + Math.random() * 500
			await asyncTimeout(randomTimeout)
			randomBase *= 2
			continue
		}
		return response
	}

	throw new Error(``)
}

export async function getContact(options: GetContactOptions) {
	return retryWithExponentialBackoff(() => resend.contacts.get(options))
}

export async function createContact(options: CreateContactOptions) {
	return retryWithExponentialBackoff(() => resend.contacts.create(options))
}

export async function updateContact(options: UpdateContactOptions) {
	return retryWithExponentialBackoff(() => resend.contacts.update(options))
}
