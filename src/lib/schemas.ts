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
