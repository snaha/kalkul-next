import { z } from 'zod'
import type { Tables } from './typesdb'

import type {
	depositWithdrawalFormSchema,
	depositWithdrawalSchema,
	frequencySchema,
	supportedCurrenciesSchema,
} from './schemas'

export type DepositForm = z.infer<typeof depositWithdrawalFormSchema>
export type WithdrawalForm = z.infer<typeof depositWithdrawalFormSchema>
export type Deposit = z.infer<typeof depositWithdrawalSchema>
export type Withdrawal = z.infer<typeof depositWithdrawalSchema>
export type Currency = z.infer<typeof supportedCurrenciesSchema>
export type Frequency = z.infer<typeof frequencySchema>

export type CurrencyWithLabel = Record<Currency, string>

export const supportedCurrenciesWithLabels: CurrencyWithLabel = {
	CZK: 'Kč',
	EUR: '€',
	USD: '$',
} as const

export interface Store<T> {
	data: T[]
	loading: boolean
	reset: () => void
}

export type Client = Tables<'client'>
export type ClientNoId = Omit<Client, 'id' | 'created_at' | 'advisor'>

export type MetaFields = 'id' | 'created_at' | 'last_edited_at'
export type Portfolio = Tables<'portfolio'>
export type Investment = Tables<'investment'>
export type Transaction = Tables<'transaction'>

export type EntryFeeType = 'ongoing' | 'forty-sixty' | 'upfront'
export type FeeType = 'percentage' | 'fixed'

export type TimeUnit = 'day' | 'week' | 'month' | 'year'
export type TransactionType = 'deposit' | 'withdrawal'

export interface PortfolioView {
	portfolio: Portfolio
	client: Client
	investments: Investment[]
	transactions: Transaction[]
}
