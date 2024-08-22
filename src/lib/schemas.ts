import { z } from 'zod'

function toDate(value: string): Date {
	const parsedDate = new Date(value)
	if (isNaN(parsedDate.getTime())) {
		throw new Error('Invalid date format')
	}
	return parsedDate
}

export const frequencySchema = z.enum(['day', 'week', 'month', 'year'])

export const commonDepositWithdrawalFormSchema = z.object({
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

export const commonDepositWithdrawalSchema = z.object({
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

export const portfolioSchema = z.object({
	apy: z.number().nonnegative(),
	feeSuccess: z.number().nonnegative(),
	feeManagement: z.number().nonnegative(),
	entryFee: z.number().nonnegative(),
	withdrawalFee: z.number().nonnegative(),
})

export const dateOfBirthFormSchema = z.string().refine(toDate, { message: 'Invalid date format' })

export const supportedCurrencies = ['CZK', 'EUR', 'USD'] as const
export const supportedCurrenciesSchema = z.enum(supportedCurrencies)
export const dateOfBirthSchema = z.string().transform(toDate)
export const endAgeSchema = z.number().int().positive()

export const detailStoreSchema = portfolioSchema.extend({
	deposits: z.array(depositWithdrawalSchema),
	withdrawals: z.array(depositWithdrawalSchema),
	currency: supportedCurrenciesSchema,
	dateOfBirth: dateOfBirthSchema,
	endAge: endAgeSchema,
	inflation: z.number().nonnegative(),
})

export const investmentSchema = z.object({})
