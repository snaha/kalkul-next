import type {
  Client,
  ClientNoId,
  Investment,
  MetaFields,
  Portfolio,
  PortfolioView,
  Transaction,
} from '$lib/types'
import { LocalStorageAdapter } from './local-storage'

export interface Adapter {
  start: () => Promise<void> | void
  stop: () => Promise<void> | void

  addClient: (client: ClientNoId) => Promise<string>
  updateClient: (client: Partial<Client> & Pick<Client, 'id'>) => Promise<void>
  deleteClient: (client: Partial<Client> & Pick<Client, 'id'>) => Promise<void>
  getClients: () => Promise<Client[]>

  addPortfolio: (portfolio: Omit<Portfolio, MetaFields>) => Promise<string>
  updatePortfolio: (portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) => Promise<void>
  deletePortfolio: (portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>) => Promise<void>
  getPortfolios: (clientId: string) => Promise<Portfolio[]>
  getPortfolio: (portfolioId: string) => Promise<Portfolio | undefined>

  addInvestment: (investment: Omit<Investment, MetaFields>) => Promise<string>
  updateInvestment: (investment: Partial<Investment> & Pick<Investment, 'id'>) => Promise<void>
  deleteInvestment: (investment: Partial<Investment> & Pick<Investment, 'id'>) => Promise<void>
  getInvestments: (portfolioId: string) => Promise<Investment[]>
  getInvestment: (investmentId: string) => Promise<Investment | undefined>

  addGoal: (goal: Omit<Investment, MetaFields>) => Promise<string>
  updateGoal: (goal: Partial<Investment> & Pick<Investment, 'id'>) => Promise<void>

  addTransaction: (transaction: Omit<Transaction, MetaFields>) => Promise<string>
  updateTransaction: (transaction: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>
  deleteTransaction: (transaction: Partial<Transaction> & Pick<Transaction, 'id'>) => Promise<void>
  getTransactions: (investmentId: string) => Promise<Transaction[]>
  getTransaction: (transactionId: string) => Promise<Transaction | undefined>

  portfolioView: (id: string) => Promise<PortfolioView | undefined>

  exportBackup: () => string
  importBackup: (json: string) => void
}

export default new LocalStorageAdapter() as Adapter
