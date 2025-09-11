export type TransactionMap = Map<string, number>

export type TransactionType = 'deposit' | 'withdrawal'

export type Transaction = {
	date: string
	repeat?: number | null
	repeat_unit?: Period | null
	end_date?: string | null
	amount: number
	type: TransactionType
	inflation_adjusted?: boolean
}

export interface InvestmentData {
	startDate: Date
	endDate: Date
	deposits: TransactionMap
	withdrawals: TransactionMap
}

export type Period = 'day' | 'week' | 'month' | 'year' // For transactions
export type PortfolioPeriod = 'month' | 'year' // Only month/year for portfolio calculations

export type EntryFeeType = 'ongoing' | 'forty-sixty' | 'upfront'
export const DEFAULT_ENTRY_FEE_TYPE = 'ongoing' as const

export type FeeType = 'percentage' | 'fixed'
export const DEFAULT_FEE_TYPE = 'percentage' as const

export interface PortfolioPeriodCount {
	period: PortfolioPeriod
	count: number
}

export interface GraphData {
	label: string
	graphLabels: string[]
	graphDeposits: number[]
	graphWithdrawals: number[]
	graphInvestmentValues: number[]
	graphFeeValues: number[]
	graphInflationDeposits: number[]
	graphInflationWithdrawals: number[]
	graphInflationInvestmentValues: number[]
	graphInflationFeeValues: number[]
}
