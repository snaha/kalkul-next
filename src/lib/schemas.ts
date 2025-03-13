import { z } from 'zod'

function toDate(value: string): Date {
	const parsedDate = new Date(value)
	if (isNaN(parsedDate.getTime())) {
		throw new Error('Invalid date format')
	}
	return parsedDate
}

export const frequencySchema = z.enum(['day', 'week', 'month', 'year'])

const commonDepositWithdrawalFormSchema = z.object({
	name: z.string().trim().min(1),
	amount: z.number().positive(),
	startDate: z.string().refine(toDate, { message: 'Invalid date format' }),
})

export const depositWithdrawalFormSchema = z.discriminatedUnion('isRecurring', [
	commonDepositWithdrawalFormSchema.extend({
		isRecurring: z.literal(false),
	}),
	commonDepositWithdrawalFormSchema.extend({
		isRecurring: z.literal(true),
		endDate: z.string().refine(toDate, { message: 'Invalid date format' }),
		frequency: frequencySchema,
	}),
])

const commonDepositWithdrawalSchema = z.object({
	name: z.string().trim().min(1),
	amount: z.number().positive(),
	startDate: z.string().transform(toDate),
})

export const depositWithdrawalSchema = z.discriminatedUnion('isRecurring', [
	commonDepositWithdrawalSchema.extend({
		isRecurring: z.literal(false),
	}),
	commonDepositWithdrawalSchema.extend({
		isRecurring: z.literal(true),
		endDate: z.string().transform(toDate),
		frequency: frequencySchema,
	}),
])

const supportedCurrencies = ['CZK', 'EUR', 'USD'] as const
export const supportedCurrenciesSchema = z.enum(supportedCurrencies)

export const emailFormSchema = z.object({
	email: z.string().email({ message: 'emailError' }),
})

export const loginFormSchema = emailFormSchema.extend({
	password: z.string().min(6, { message: 'passwordError' }),
})

export const registerFormSchema = loginFormSchema
	.extend({
		confirmPassword: z.string(),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				code: 'custom',
				path: ['confirmPassword'],
				message: 'confirmPasswordError',
			})
		}
	})

export const resetPasswordFormSchema = z
	.object({
		newPassword: z.string().min(6, { message: 'passwordError' }),
		confirmNewPassword: z.string(),
	})
	.superRefine((data, ctx) => {
		if (data.newPassword !== data.confirmNewPassword) {
			ctx.addIssue({
				code: 'custom',
				path: ['confirmNewPassword'],
				message: 'confirmPasswordError',
			})
		}
	})
