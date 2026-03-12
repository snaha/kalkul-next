import type { Period, TransactionType } from './@snaha/kalkul-maths'
import type { ChartDataset, ChartTypeRegistry } from 'chart.js'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Store<T> {
  data: (Omit<T, MetaFields> & { id: number | string })[]
  loading: boolean
  reset: () => void
}

export type MetaFields = 'id' | 'created_at' | 'last_edited_at'

export interface Client {
  id: string
  name: string
  email: string
  birth_date: string
  created_at: string
}

export type ClientNoId = Omit<Client, 'id' | 'created_at'>

export interface Portfolio {
  id: string
  name: string
  client: string
  currency: string
  start_date: string
  end_date: string
  inflation_rate: number
  link: string | null
  created_at: string
  last_edited_at: string
}

export interface Investment {
  id: string
  portfolio_id: string
  name: string
  apy: number | null
  type: string | null
  created_at: string
  last_edited_at: string | null
  advanced_fees: boolean | null
  entry_fee: number | null
  entry_fee_type: string | null
  exit_fee: number | null
  exit_fee_type: string | null
  management_fee: number | null
  management_fee_type: string | null
  success_fee: number | null
  ter: number | null
  goal_data?: Json
}

export interface Transaction {
  id: string
  investment_id: string
  amount: number
  date: string
  end_date: string | null
  type: TransactionType
  created_at: string
  last_edited_at: string | null
  inflation_adjusted: boolean
  label: string | null
  repeat: number | null
  repeat_unit: Period | null
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

// Goal-related types
export type PeriodicWithdrawalGoalData = {
  depositStart: string
  depositPeriod: 'month' | 'year'
  currentSavings: number
  customDepositAmount?: number
  withdrawalStart: string
  withdrawalDuration: number
  desiredBudget: number
  budgetPeriod: 'month' | 'year'
  apy: number
  inflation: number
}

export type RetirementGoalData = PeriodicWithdrawalGoalData & {
  type: 'retirement'
}

export type EducationGoalData = PeriodicWithdrawalGoalData & {
  type: 'education'
  childName: string
  name: string
}

export type GoalData = RetirementGoalData | EducationGoalData

export type Goal = Investment & {
  goal_data: GoalData
}
