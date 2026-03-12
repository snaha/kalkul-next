import type { ChartDataset, ChartTypeRegistry } from 'chart.js'

// Re-export schema-derived types
export type {
  Json,
  Client,
  Portfolio,
  Investment,
  Transaction,
  InvestmentNested,
  PortfolioNested,
  ClientNested,
  PeriodicWithdrawalGoalData,
  RetirementGoalData,
  EducationGoalData,
  GoalData,
  Goal,
} from './schemas'

import type { Client, Investment, Portfolio } from './schemas'

export type MetaFields = 'id' | 'created_at' | 'last_edited_at'

export type ClientNoId = Omit<Client, 'id' | 'created_at'>

export type InvestmentWithColorIndex = Investment & {
  colorIndex?: number
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
