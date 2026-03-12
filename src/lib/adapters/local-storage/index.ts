import type { Adapter } from '$lib/adapters'
import type {
  Client,
  ClientNoId,
  Investment,
  MetaFields,
  Portfolio,
  PortfolioView,
  Transaction,
} from '$lib/types'
import { clientStore } from '$lib/stores/clients.svelte'
import { portfolioStore } from '$lib/stores/portfolio.svelte'
import { investmentStore } from '$lib/stores/investment.svelte'
import { transactionStore } from '$lib/stores/transaction.svelte'

const STORAGE_KEY = 'kalkul-data'

interface StorageData {
  clients: Client[]
  portfolios: Portfolio[]
  investments: Investment[]
  transactions: Transaction[]
}

function loadData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as StorageData
    }
  } catch {
    // Corrupted data — start fresh
  }
  return { clients: [], portfolios: [], investments: [], transactions: [] }
}

function saveData(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getCurrentData(): StorageData {
  return {
    clients: clientStore.data,
    portfolios: portfolioStore.data,
    investments: investmentStore.data,
    transactions: transactionStore.data,
  }
}

function persist(): void {
  saveData(getCurrentData())
}

function now(): string {
  return new Date().toISOString()
}

export class LocalStorageAdapter implements Adapter {
  start(): void {
    const data = loadData()
    clientStore.data = data.clients
    portfolioStore.data = data.portfolios
    investmentStore.data = data.investments
    transactionStore.data = data.transactions
  }

  stop(): void {
    // Nothing to clean up
  }

  // --- Clients ---

  async addClient(client: ClientNoId): Promise<string> {
    const id = crypto.randomUUID()
    const newClient: Client = {
      ...client,
      id,
      created_at: now(),
    }
    clientStore.data = [...clientStore.data, newClient]
    persist()
    return id
  }

  async updateClient(client: Partial<Client> & Pick<Client, 'id'>): Promise<void> {
    clientStore.data = clientStore.data.map((c) => (c.id === client.id ? { ...c, ...client } : c))
    persist()
  }

  async deleteClient(client: Partial<Client> & Pick<Client, 'id'>): Promise<void> {
    // Cascade: delete portfolios → investments → transactions
    const portfolios = portfolioStore.data.filter((p) => p.client === client.id)
    for (const portfolio of portfolios) {
      await this.deletePortfolio({ id: portfolio.id })
    }
    clientStore.data = clientStore.data.filter((c) => c.id !== client.id)
    persist()
  }

  async getClients(): Promise<Client[]> {
    return clientStore.data
  }

  // --- Portfolios ---

  async addPortfolio(portfolio: Omit<Portfolio, MetaFields>): Promise<string> {
    const id = crypto.randomUUID()
    const newPortfolio: Portfolio = {
      ...portfolio,
      id,
      created_at: now(),
      last_edited_at: now(),
    }
    portfolioStore.data = [...portfolioStore.data, newPortfolio]
    persist()
    return id
  }

  async updatePortfolio(portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>): Promise<void> {
    portfolioStore.data = portfolioStore.data.map((p) =>
      p.id === portfolio.id ? { ...p, ...portfolio, last_edited_at: now() } : p,
    )
    persist()
  }

  async deletePortfolio(portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>): Promise<void> {
    // Cascade: delete investments → transactions
    const investments = investmentStore.data.filter((i) => i.portfolio_id === portfolio.id)
    for (const investment of investments) {
      await this.deleteInvestment({ id: investment.id })
    }
    portfolioStore.data = portfolioStore.data.filter((p) => p.id !== portfolio.id)
    persist()
  }

  async getPortfolios(clientId: string): Promise<Portfolio[]> {
    return portfolioStore.data.filter((p) => p.client === clientId)
  }

  async getPortfolio(portfolioId: string): Promise<Portfolio | undefined> {
    return portfolioStore.data.find((p) => p.id === portfolioId)
  }

  // --- Investments ---

  async addInvestment(investment: Omit<Investment, MetaFields>): Promise<string> {
    const id = crypto.randomUUID()
    const newInvestment: Investment = {
      ...investment,
      id,
      created_at: now(),
      last_edited_at: now(),
    }
    investmentStore.data = [...investmentStore.data, newInvestment]
    persist()
    return id
  }

  async updateInvestment(investment: Partial<Investment> & Pick<Investment, 'id'>): Promise<void> {
    investmentStore.data = investmentStore.data.map((i) =>
      i.id === investment.id ? { ...i, ...investment, last_edited_at: now() } : i,
    )
    persist()
  }

  async deleteInvestment(investment: Partial<Investment> & Pick<Investment, 'id'>): Promise<void> {
    // Cascade: delete transactions
    transactionStore.data = transactionStore.data.filter((t) => t.investment_id !== investment.id)
    investmentStore.data = investmentStore.data.filter((i) => i.id !== investment.id)
    persist()
  }

  async getInvestments(portfolioId: string): Promise<Investment[]> {
    return investmentStore.data.filter((i) => i.portfolio_id === portfolioId)
  }

  async getInvestment(investmentId: string): Promise<Investment | undefined> {
    return investmentStore.data.find((i) => i.id === investmentId)
  }

  // --- Goals (goals are investments with goal_data) ---

  async addGoal(goal: Omit<Investment, MetaFields>): Promise<string> {
    return this.addInvestment(goal)
  }

  async updateGoal(goal: Partial<Investment> & Pick<Investment, 'id'>): Promise<void> {
    return this.updateInvestment(goal)
  }

  // --- Transactions ---

  async addTransaction(transaction: Omit<Transaction, MetaFields>): Promise<string> {
    const id = crypto.randomUUID()
    const newTransaction: Transaction = {
      ...transaction,
      id,
      created_at: now(),
      last_edited_at: now(),
    }
    transactionStore.data = [...transactionStore.data, newTransaction]
    persist()
    return id
  }

  async updateTransaction(
    transaction: Partial<Transaction> & Pick<Transaction, 'id'>,
  ): Promise<void> {
    transactionStore.data = transactionStore.data.map((t) =>
      t.id === transaction.id ? { ...t, ...transaction, last_edited_at: now() } : t,
    )
    persist()
  }

  async deleteTransaction(
    transaction: Partial<Transaction> & Pick<Transaction, 'id'>,
  ): Promise<void> {
    transactionStore.data = transactionStore.data.filter((t) => t.id !== transaction.id)
    persist()
  }

  async getTransactions(investmentId: string): Promise<Transaction[]> {
    return transactionStore.data.filter((t) => t.investment_id === investmentId)
  }

  async getTransaction(transactionId: string): Promise<Transaction | undefined> {
    return transactionStore.data.find((t) => t.id === transactionId)
  }

  // --- Portfolio View ---

  async portfolioView(id: string): Promise<PortfolioView | undefined> {
    const portfolio = portfolioStore.data.find((p) => p.id === id)
    if (!portfolio) return undefined

    const client = clientStore.data.find((c) => c.id === portfolio.client)
    if (!client) return undefined

    const investments = investmentStore.data.filter((i) => i.portfolio_id === id)
    const investmentIds = new Set(investments.map((i) => i.id))
    const transactions = transactionStore.data.filter((t) => investmentIds.has(t.investment_id))

    return { portfolio, client, investments, transactions }
  }

  // --- Backup / Restore ---

  exportBackup(): string {
    return JSON.stringify(getCurrentData(), undefined, 2)
  }

  importBackup(json: string): void {
    const data = JSON.parse(json) as StorageData
    if (!data.clients || !data.portfolios || !data.investments || !data.transactions) {
      throw new Error('Invalid backup format')
    }
    saveData(data)
    this.start()
  }
}
