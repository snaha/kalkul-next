import type { Period, TransactionType } from './@snaha/kalkul-maths'
import type { Tables, Json } from './typesdb'
import type { ChartDataset, ChartTypeRegistry } from 'chart.js'

export interface Store<T> {
	data: (Omit<T, MetaFields> & { id: number | string })[]
	loading: boolean
	reset: () => void
}

export type Client = Tables<'client'>
export type ClientNoId = Omit<Client, 'id' | 'created_at' | 'advisor'>

export type MetaFields = 'id' | 'created_at' | 'last_edited_at'
export type Portfolio = Tables<'portfolio'>
// Make goal_data optional for backward compatibility with existing code
export type Investment = Omit<Tables<'investment'>, 'goal_data'> & { goal_data?: Json }
export type Transaction = Tables<'transaction'> & {
	repeat_unit: Period | null
	type: TransactionType
}

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

export type TypedUserMetadata = {
	prefer_language: string
	newsletter_consent: boolean
	first_visit: boolean
	promotion_code?: string
}

export type StripeSubscription = Tables<'stripe_subscription'>

export interface ApiToken {
	id: string
	token_prefix: string
	name: string
	created_at: string
	last_used_at: string | null
	is_active: boolean
	user_id: string
	token_hash: string // New field
}

// Goal types
export type RetirementGoalData = {
	type: 'retirement'
	depositStart: string // ISO date
	depositPeriod: 'month' | 'year'
	currentSavings: number
	customDepositAmount?: number
	retirementStart: string // ISO date
	retirementLength: number // years
	desiredBudget: number
	budgetPeriod: 'month' | 'year'
	apy: number // percentage
	inflation: number // percentage
}

export type EducationGoalData = {
	type: 'education'
	childName?: string
	childBirthDate?: string // ISO date
	depositStart: string // ISO date
	depositPeriod: 'month' | 'year'
	currentSavings: number
	customDepositAmount?: number
	educationStart: string // ISO date
	educationDuration: number // years
	desiredBudget: number
	budgetPeriod: 'month' | 'year'
	apy: number // percentage
	inflation: number // percentage
}

export type GoalData = RetirementGoalData | EducationGoalData

// Investment with goal data
export type Goal = Investment & {
	goal_data: GoalData
}
