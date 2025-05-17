import { z } from 'zod'

export const emailFormSchema = z.object({
	email: z.string().email({ message: 'emailError' }),
})

export const loginFormSchema = emailFormSchema.extend({
	password: z.string().min(6, { message: 'passwordError' }),
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
