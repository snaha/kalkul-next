import { z } from 'zod'

export const emailFormSchema = z.object({
	email: z.string().email({ message: 'error.emailError' }),
})

export const loginFormSchema = emailFormSchema.extend({
	password: z.string().min(6, { message: 'error.passwordLengthError' }),
})

export const resetPasswordFormSchema = z
	.object({
		newPassword: z.string().min(6, { message: 'error.passwordLengthError' }),
		confirmNewPassword: z.string(),
	})
	.superRefine((data, ctx) => {
		if (data.newPassword !== data.confirmNewPassword) {
			ctx.addIssue({
				code: 'custom',
				path: ['confirmNewPassword'],
				message: 'error.confirmPasswordError',
			})
		}
	})

export const figiSchema = z.object({
	compositeFIGI: z.string().nullable(),
	exchCode: z.string().nullable(),
	figi: z.string(),
	marketSector: z.string(),
	name: z.string(),
	securityDescription: z.string(),
	securityType: z.string(),
	securityType2: z.string(),
	shareClassFIGI: z.string().nullable(),
	ticker: z.string(),
})

export type FigiSchema = z.infer<typeof figiSchema>

export const figiWarningResponseSchema = z.object({
	warning: z.string(),
})

export const figiResponseSchema = z.array(
	z.union([
		figiWarningResponseSchema,
		z.object({
			data: z.array(figiSchema),
		}),
	]),
)

export const marketstackErrorResponseSchema = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
	}),
})

export const marketstackEodResponseSchema = z.union([
	marketstackErrorResponseSchema,
	z.object({
		pagination: z.object({
			limit: z.number(),
			offset: z.number(),
			count: z.number(),
			total: z.number(),
		}),
		data: z.array(
			z.object({
				open: z.number(),
				high: z.number(),
				low: z.number(),
				close: z.number(),
				volume: z.nullable(z.number()),
				adj_high: z.number(),
				adj_low: z.number(),
				adj_open: z.number(),
				adj_close: z.number(),
				adj_volume: z.nullable(z.number()),
				split_factor: z.number(),
				dividend: z.number(),
				name: z.nullable(z.string()),
				exchange_code: z.nullable(z.string()),
				asset_type: z.nullable(z.string()),
				price_currency: z.nullable(z.string()),
				symbol: z.string(),
				exchange: z.string(),
				date: z.string(),
			}),
		),
	}),
])

export const marketstackIndexInfoSchema = z.object({
	benchmark: z.string(),
	region: z.string(),
	country: z.string(),
	price: z.string(),
	price_change_day: z.string(),
	percentage_day: z.string(),
	percentage_week: z.string(),
	percentage_month: z.string(),
	percentage_year: z.string(),
	date: z.string(),
})

export type MarketstackIndexInfoSchema = z.infer<typeof marketstackIndexInfoSchema>

export const marketstackIndexInfoResponseSchema = z.union([
	marketstackErrorResponseSchema,
	z.array(marketstackIndexInfoSchema),
])
