import type {
  Client,
  ClientNested,
  ClientNoId,
  GoalData,
  Investment,
  InvestmentNested,
  MetaFields,
  Portfolio,
  PortfolioNested,
  Transaction,
} from '$lib/types'

const STORAGE_KEY = 'kalkul-data'

function loadData(): ClientNested[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as ClientNested[]
    }
  } catch (e) {
    console.error('Failed to load data from localStorage', e)
  }
  return []
}

function now(): string {
  return new Date().toISOString()
}

function withAppStore() {
  let clients = $state<ClientNested[]>([])
  let loading = $state(true)

  function persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
  }

  function findPortfolioWithParent(
    portfolioId: string,
  ): { client: ClientNested; portfolio: PortfolioNested } | undefined {
    for (const client of clients) {
      const portfolio = client.portfolios.find((p) => p.id === portfolioId)
      if (portfolio) return { client, portfolio }
    }
    return undefined
  }

  return {
    get clients() {
      return clients
    },
    set clients(value: ClientNested[]) {
      clients = value
      loading = false
    },
    get loading() {
      return loading
    },
    set loading(value: boolean) {
      loading = value
    },
    reset() {
      clients = []
      loading = true
    },

    // --- Load ---

    load(): void {
      clients = loadData()
      loading = false
    },

    // --- Finders ---

    findClient(id: string): ClientNested | undefined {
      return clients.find((c) => c.id === id)
    },

    findPortfolio(portfolioId: string): PortfolioNested | undefined {
      for (const client of clients) {
        const portfolio = client.portfolios.find((p) => p.id === portfolioId)
        if (portfolio) return portfolio
      }
      return undefined
    },

    findInvestment(investmentId: string): InvestmentNested | undefined {
      for (const client of clients) {
        for (const portfolio of client.portfolios) {
          const investment = portfolio.investments.find((i) => i.id === investmentId)
          if (investment) return investment
        }
      }
      return undefined
    },

    findTransaction(transactionId: string): Transaction | undefined {
      for (const client of clients) {
        for (const portfolio of client.portfolios) {
          for (const investment of portfolio.investments) {
            const transaction = investment.transactions.find((t) => t.id === transactionId)
            if (transaction) return transaction
          }
        }
      }
      return undefined
    },

    getPortfolios(clientId: string): PortfolioNested[] {
      return clients.find((c) => c.id === clientId)?.portfolios ?? []
    },

    getInvestments(portfolioId: string): InvestmentNested[] {
      for (const client of clients) {
        const portfolio = client.portfolios.find((p) => p.id === portfolioId)
        if (portfolio) return portfolio.investments
      }
      return []
    },

    getGoals(portfolioId: string): (InvestmentNested & { goal_data: GoalData })[] {
      const investments = this.getInvestments(portfolioId)
      return investments.filter(
        (i): i is InvestmentNested & { goal_data: GoalData } =>
          i.goal_data !== undefined && i.goal_data !== null,
      )
    },

    getRegularInvestments(portfolioId: string): InvestmentNested[] {
      const investments = this.getInvestments(portfolioId)
      return investments.filter((i) => i.goal_data === undefined || i.goal_data === null)
    },

    getTransactions(investmentId: string): Transaction[] {
      const investment = this.findInvestment(investmentId)
      return investment?.transactions ?? []
    },

    // --- Clients ---

    addClient(client: ClientNoId): string {
      const id = crypto.randomUUID()
      const newClient: ClientNested = {
        ...client,
        id,
        created_at: now(),
        portfolios: [],
      }
      clients.push(newClient)
      persist()
      return id
    },

    updateClient(client: Partial<Client> & Pick<Client, 'id'>): void {
      const found = this.findClient(client.id)
      if (found) Object.assign(found, client)
      persist()
    },

    deleteClient(client: Partial<Client> & Pick<Client, 'id'>): void {
      const idx = clients.findIndex((c) => c.id === client.id)
      if (idx !== -1) clients.splice(idx, 1)
      persist()
    },

    // --- Portfolios ---

    addPortfolio(clientId: string, portfolio: Omit<Portfolio, MetaFields>): string {
      const id = crypto.randomUUID()
      const newPortfolio: PortfolioNested = {
        ...portfolio,
        id,
        created_at: now(),
        last_edited_at: now(),
        investments: [],
      }
      const client = this.findClient(clientId)
      if (client) client.portfolios.push(newPortfolio)
      persist()
      return id
    },

    updatePortfolio(portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>): void {
      const found = this.findPortfolio(portfolio.id)
      if (found) Object.assign(found, portfolio, { last_edited_at: now() })
      persist()
    },

    deletePortfolio(portfolio: Partial<Portfolio> & Pick<Portfolio, 'id'>): void {
      const result = findPortfolioWithParent(portfolio.id)
      if (result) {
        const idx = result.client.portfolios.indexOf(result.portfolio)
        if (idx !== -1) result.client.portfolios.splice(idx, 1)
      }
      persist()
    },

    // --- Investments ---

    addInvestment(portfolioId: string, investment: Omit<Investment, MetaFields>): string {
      const id = crypto.randomUUID()
      const newInvestment: InvestmentNested = {
        ...investment,
        id,
        created_at: now(),
        last_edited_at: now(),
        transactions: [],
      }
      const portfolio = this.findPortfolio(portfolioId)
      if (portfolio) portfolio.investments.push(newInvestment)
      persist()
      return id
    },

    updateInvestment(investment: Partial<Investment> & Pick<Investment, 'id'>): void {
      const found = this.findInvestment(investment.id)
      if (found) Object.assign(found, investment, { last_edited_at: now() })
      persist()
    },

    deleteInvestment(investment: Partial<Investment> & Pick<Investment, 'id'>): void {
      for (const client of clients) {
        for (const portfolio of client.portfolios) {
          const idx = portfolio.investments.findIndex((i) => i.id === investment.id)
          if (idx !== -1) {
            portfolio.investments.splice(idx, 1)
            persist()
            return
          }
        }
      }
      persist()
    },

    // --- Transactions ---

    addTransaction(transaction: Omit<Transaction, MetaFields>): string {
      const id = crypto.randomUUID()
      const newTransaction: Transaction = {
        ...transaction,
        id,
        created_at: now(),
        last_edited_at: now(),
      }
      const investment = this.findInvestment(transaction.investment_id)
      if (investment) investment.transactions.push(newTransaction)
      persist()
      return id
    },

    updateTransaction(transaction: Partial<Transaction> & Pick<Transaction, 'id'>): void {
      const found = this.findTransaction(transaction.id)
      if (found) Object.assign(found, transaction, { last_edited_at: now() })
      persist()
    },

    deleteTransaction(transaction: Partial<Transaction> & Pick<Transaction, 'id'>): void {
      for (const client of clients) {
        for (const portfolio of client.portfolios) {
          for (const investment of portfolio.investments) {
            const idx = investment.transactions.findIndex((t) => t.id === transaction.id)
            if (idx !== -1) {
              investment.transactions.splice(idx, 1)
              persist()
              return
            }
          }
        }
      }
      persist()
    },

    // --- Duplication ---

    duplicatePortfolio(clientId: string, portfolioId: string): string | undefined {
      const client = this.findClient(clientId)
      if (!client) return undefined
      const original = client.portfolios.find((p) => p.id === portfolioId)
      if (!original) return undefined

      const newPortfolioId = crypto.randomUUID()
      const newPortfolio: PortfolioNested = {
        ...original,
        id: newPortfolioId,
        name: original.name + ' - Copy',
        created_at: now(),
        last_edited_at: now(),
        investments: original.investments.map((inv) => {
          const newInvestmentId = crypto.randomUUID()
          return {
            ...inv,
            id: newInvestmentId,
            created_at: now(),
            last_edited_at: now(),
            transactions: inv.transactions.map((t) => ({
              ...t,
              id: crypto.randomUUID(),
              investment_id: newInvestmentId,
              created_at: now(),
              last_edited_at: now(),
            })),
          }
        }),
      }
      client.portfolios.push(newPortfolio)
      persist()
      return newPortfolioId
    },

    duplicateInvestment(investmentId: string, targetPortfolioId: string): string | undefined {
      const original = this.findInvestment(investmentId)
      if (!original) return undefined
      const targetPortfolio = this.findPortfolio(targetPortfolioId)
      if (!targetPortfolio) return undefined

      const newInvestmentId = crypto.randomUUID()
      const newInvestment: InvestmentNested = {
        ...original,
        id: newInvestmentId,
        created_at: now(),
        last_edited_at: now(),
        transactions: original.transactions.map((t) => ({
          ...t,
          id: crypto.randomUUID(),
          investment_id: newInvestmentId,
          created_at: now(),
          last_edited_at: now(),
        })),
      }
      targetPortfolio.investments.push(newInvestment)
      persist()
      return newInvestmentId
    },

    // --- Backup / Restore ---

    exportBackup(): string {
      return JSON.stringify(clients, undefined, 2)
    },

    importBackup(json: string): void {
      const parsed = JSON.parse(json) as unknown
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid backup format')
      }
      clients = parsed as ClientNested[]
      loading = false
      persist()
    },
  }
}

export const appStore = withAppStore()
