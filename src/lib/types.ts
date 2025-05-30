import type { Period, TransactionType } from './@snaha/kalkul-maths'
import type { Tables } from './typesdb'
import type { ChartDataset, ChartTypeRegistry } from 'chart.js'

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
export type Transaction = Tables<'transaction'> & {
	repeat_unit: Period | null
	type: TransactionType
}
export type Feedback = Tables<'feedback'>

export type InvestmentWithColorIndex = Investment & {
	colorIndex?: number
}

export interface PortfolioView {
	portfolio: Portfolio
	client: Client
	investments: Investment[]
	transactions: Transaction[]
}

export type TooltipData = {
	dataIndex: number
	value: number
	colorIndex: number
	name: string
	type?: string
}

export type CustomDataset<T extends keyof ChartTypeRegistry> = ChartDataset<T> & {
	colorIndex: number
	label: string
}

export type ChartDatasetWithColor = ChartDataset & {
	colorIndex?: number
}
