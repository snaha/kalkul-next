import { z } from 'zod'

export const emailFormSchema = z.object({
  email: z.string().email({ message: 'error.emailError' }),
})

export const figiSchema = z.object({
  compositeFIGI: z.string().nullable(),
  exchCode: z.string().nullable(),
  figi: z.string(),
  marketSector: z.string(),
  name: z.string(),
  securityDescription: z.string().nullable(),
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
