import { SvelteSet } from 'svelte/reactivity'
import type {
  ClientNested,
  ClientNoId,
  EnrichedClient,
  EnrichedInvestment,
  EnrichedPortfolio,
  EnrichedTransaction,
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

// WeakMap for parent back-references (child → parent)
const parentMap = new WeakMap<object, object>()

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function defineMethod(obj: object, name: string, fn: Function): void {
  Object.defineProperty(obj, name, {
    value: fn,
    enumerable: false,
    configurable: true,
    writable: true,
  })
}

function withAppStore() {
  let clients = $state.raw<EnrichedClient[]>([])
  let loading = $state(true)
  const hiddenInvestmentIds = new SvelteSet<string>()

  function persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
    // Trigger reactivity: $state.raw only signals on reassignment, so create
    // a new array reference after every mutation.
    clients = [...clients]
  }

  function enrichTransaction(tx: Transaction): EnrichedTransaction {
    const enriched = tx as EnrichedTransaction

    defineMethod(enriched, 'update', (updates: Partial<Omit<Transaction, 'id'>>) => {
      Object.assign(enriched, updates, { last_edited_at: now() })
      persist()
    })

    defineMethod(enriched, 'delete', () => {
      const investment = parentMap.get(enriched) as EnrichedInvestment | undefined
      if (investment) {
        const idx = investment.transactions.findIndex((t) => t.id === enriched.id)
        if (idx !== -1) investment.transactions.splice(idx, 1)
        persist()
      }
    })

    defineMethod(enriched, 'duplicate', () => {
      const investment = parentMap.get(enriched) as EnrichedInvestment | undefined
      if (!investment) return ''
      const id = crypto.randomUUID()
      const newTx: Transaction = {
        type: enriched.type,
        amount: enriched.amount,
        label: enriched.label,
        date: enriched.date,
        inflation_adjusted: enriched.inflation_adjusted,
        repeat: enriched.repeat,
        repeat_unit: enriched.repeat_unit,
        end_date: enriched.end_date,
        id,
        created_at: now(),
        last_edited_at: now(),
      }
      const enrichedNew = enrichTransaction(newTx)
      parentMap.set(enrichedNew, investment)
      investment.transactions.push(enrichedNew)
      persist()
      return id
    })

    return enriched
  }

  function enrichInvestment(inv: InvestmentNested): EnrichedInvestment {
    const enriched = inv as unknown as EnrichedInvestment

    // Enrich child transactions
    for (const tx of enriched.transactions) {
      enrichTransaction(tx as Transaction)
      parentMap.set(tx, enriched)
    }

    defineMethod(enriched, 'update', (updates: Partial<Omit<Investment, 'id'>>) => {
      Object.assign(enriched, updates, { last_edited_at: now() })
      persist()
    })

    defineMethod(enriched, 'delete', () => {
      const portfolio = parentMap.get(enriched) as EnrichedPortfolio | undefined
      if (portfolio) {
        // Search both investments and goals arrays
        let idx = portfolio.investments.findIndex((i) => i.id === enriched.id)
        if (idx !== -1) {
          portfolio.investments.splice(idx, 1)
        } else {
          idx = portfolio.goals.findIndex((i) => i.id === enriched.id)
          if (idx !== -1) portfolio.goals.splice(idx, 1)
        }
        persist()
      }
    })

    defineMethod(enriched, 'duplicate', () => {
      const portfolio = parentMap.get(enriched) as EnrichedPortfolio | undefined
      if (!portfolio) return undefined

      const newInvestmentId = crypto.randomUUID()
      const newInvestment: InvestmentNested = {
        ...spreadInvestment(enriched),
        id: newInvestmentId,
        created_at: now(),
        last_edited_at: now(),
        transactions: enriched.transactions.map((t) => ({
          ...spreadTransaction(t),
          id: crypto.randomUUID(),
          created_at: now(),
          last_edited_at: now(),
        })),
      }
      const enrichedNew = enrichInvestment(newInvestment)
      parentMap.set(enrichedNew, portfolio)
      // Add to the same array (investments or goals) as the original
      const isGoal = portfolio.goals.some((g) => g.id === enriched.id)
      if (isGoal) {
        portfolio.goals.push(enrichedNew)
      } else {
        portfolio.investments.push(enrichedNew)
      }
      persist()
      return newInvestmentId
    })

    defineMethod(enriched, 'addTransaction', (data: Omit<Transaction, MetaFields>) => {
      const id = crypto.randomUUID()
      const newTx: Transaction = {
        ...data,
        id,
        created_at: now(),
        last_edited_at: now(),
      }
      const enrichedTx = enrichTransaction(newTx)
      parentMap.set(enrichedTx, enriched)
      enriched.transactions.push(enrichedTx)
      persist()
      return id
    })

    // Visibility methods (non-enumerable, not persisted)
    Object.defineProperty(enriched, 'hidden', {
      get: () => hiddenInvestmentIds.has(enriched.id),
      enumerable: false,
      configurable: true,
    })

    defineMethod(enriched, 'toggleHide', () => {
      if (hiddenInvestmentIds.has(enriched.id)) {
        hiddenInvestmentIds.delete(enriched.id)
      } else {
        hiddenInvestmentIds.add(enriched.id)
      }
    })

    defineMethod(enriched, 'toggleFocus', () => {
      const portfolio = parentMap.get(enriched) as EnrichedPortfolio | undefined
      if (!portfolio) return

      // Get siblings from the same array (investments or goals)
      const isGoal = portfolio.goals.some((g) => g.id === enriched.id)
      const siblings = isGoal ? portfolio.goals : portfolio.investments

      // If already focused (only visible among siblings), show all
      const othersHidden = siblings.every(
        (s) => s.id === enriched.id || hiddenInvestmentIds.has(s.id),
      )
      if (othersHidden && !hiddenInvestmentIds.has(enriched.id)) {
        for (const s of siblings) {
          hiddenInvestmentIds.delete(s.id)
        }
      } else {
        for (const s of siblings) {
          if (s.id !== enriched.id) {
            hiddenInvestmentIds.add(s.id)
          } else {
            hiddenInvestmentIds.delete(s.id)
          }
        }
      }
    })

    Object.defineProperty(enriched, 'focused', {
      get: () => {
        const portfolio = parentMap.get(enriched) as EnrichedPortfolio | undefined
        if (!portfolio) return false
        const isGoal = portfolio.goals.some((g) => g.id === enriched.id)
        const siblings = isGoal ? portfolio.goals : portfolio.investments
        if (siblings.length <= 1) return false
        return siblings.every(
          (s) => s.id === enriched.id || hiddenInvestmentIds.has(s.id),
        ) && !hiddenInvestmentIds.has(enriched.id)
      },
      enumerable: false,
      configurable: true,
    })

    return enriched
  }

  function enrichPortfolio(portfolio: PortfolioNested): EnrichedPortfolio {
    const enriched = portfolio as unknown as EnrichedPortfolio

    // Data migration: split investments into investments and goals if goals array is missing
    if (!enriched.goals) {
      const allInvestments = enriched.investments as unknown as InvestmentNested[]
      const goals: InvestmentNested[] = []
      const regularInvestments: InvestmentNested[] = []
      for (const inv of allInvestments) {
        if (inv.goal_data !== undefined && inv.goal_data !== null) {
          goals.push(inv)
        } else {
          regularInvestments.push(inv)
        }
      }
      ;(enriched as unknown as PortfolioNested).investments = regularInvestments
      ;(enriched as unknown as PortfolioNested).goals = goals
    }

    // Enrich child investments
    for (const inv of enriched.investments) {
      enrichInvestment(inv as unknown as InvestmentNested)
      parentMap.set(inv, enriched)
    }

    // Enrich child goals
    for (const goal of enriched.goals) {
      enrichInvestment(goal as unknown as InvestmentNested)
      parentMap.set(goal, enriched)
    }

    defineMethod(enriched, 'update', (updates: Partial<Omit<Portfolio, 'id'>>) => {
      Object.assign(enriched, updates, { last_edited_at: now() })
      persist()
    })

    defineMethod(enriched, 'delete', () => {
      const client = parentMap.get(enriched) as EnrichedClient | undefined
      if (client) {
        const idx = client.portfolios.findIndex((p) => p.id === enriched.id)
        if (idx !== -1) client.portfolios.splice(idx, 1)
        persist()
      }
    })

    defineMethod(enriched, 'duplicate', () => {
      const client = parentMap.get(enriched) as EnrichedClient | undefined
      if (!client) return undefined

      function deepCopyInvestments(investments: EnrichedInvestment[]) {
        return investments.map((inv) => {
          const newInvestmentId = crypto.randomUUID()
          return {
            ...spreadInvestment(inv),
            id: newInvestmentId,
            created_at: now(),
            last_edited_at: now(),
            transactions: inv.transactions.map((t) => ({
              ...spreadTransaction(t),
              id: crypto.randomUUID(),
              created_at: now(),
              last_edited_at: now(),
            })),
          }
        })
      }

      const newPortfolioId = crypto.randomUUID()
      const newPortfolio: PortfolioNested = {
        ...spreadPortfolio(enriched),
        id: newPortfolioId,
        name: enriched.name + ' - Copy',
        created_at: now(),
        last_edited_at: now(),
        investments: deepCopyInvestments(enriched.investments),
        goals: deepCopyInvestments(enriched.goals),
      }
      const enrichedNew = enrichPortfolio(newPortfolio)
      parentMap.set(enrichedNew, client)
      client.portfolios.push(enrichedNew)
      persist()
      return newPortfolioId
    })

    defineMethod(enriched, 'addInvestment', (data: Omit<Investment, MetaFields>) => {
      const id = crypto.randomUUID()
      const newInvestment: InvestmentNested = {
        ...data,
        id,
        created_at: now(),
        last_edited_at: now(),
        transactions: [],
      }
      const enrichedInv = enrichInvestment(newInvestment)
      parentMap.set(enrichedInv, enriched)
      enriched.investments.push(enrichedInv)
      persist()
      return id
    })

    defineMethod(enriched, 'addGoal', (data: Omit<Investment, MetaFields>) => {
      const id = crypto.randomUUID()
      const newGoal: InvestmentNested = {
        ...data,
        id,
        created_at: now(),
        last_edited_at: now(),
        transactions: [],
      }
      const enrichedGoal = enrichInvestment(newGoal)
      parentMap.set(enrichedGoal, enriched)
      enriched.goals.push(enrichedGoal)
      persist()
      return id
    })

    return enriched
  }

  function enrichClient(client: ClientNested): EnrichedClient {
    const enriched = client as unknown as EnrichedClient

    // Enrich child portfolios
    for (const portfolio of enriched.portfolios) {
      enrichPortfolio(portfolio as unknown as PortfolioNested)
      parentMap.set(portfolio, enriched)
    }

    defineMethod(
      enriched,
      'update',
      (updates: Partial<Omit<ClientNested, 'id' | 'created_at' | 'portfolios'>>) => {
        Object.assign(enriched, updates)
        persist()
      },
    )

    defineMethod(enriched, 'delete', () => {
      const idx = clients.findIndex((c) => c.id === enriched.id)
      if (idx !== -1) clients.splice(idx, 1)
      persist()
    })

    defineMethod(enriched, 'addPortfolio', (data: Omit<Portfolio, MetaFields>) => {
      const id = crypto.randomUUID()
      const newPortfolio: PortfolioNested = {
        ...data,
        id,
        created_at: now(),
        last_edited_at: now(),
        investments: [],
        goals: [],
      }
      const enrichedPortf = enrichPortfolio(newPortfolio)
      parentMap.set(enrichedPortf, enriched)
      enriched.portfolios.push(enrichedPortf)
      persist()
      return id
    })

    return enriched
  }

  function enrichAll(rawClients: ClientNested[]): EnrichedClient[] {
    return rawClients.map((c) => enrichClient(c))
  }

  // Spread helpers to extract plain data without methods
  function spreadTransaction(t: EnrichedTransaction | Transaction): Transaction {
    return {
      id: t.id,
      amount: t.amount,
      date: t.date,
      end_date: t.end_date,
      type: t.type,
      created_at: t.created_at,
      last_edited_at: t.last_edited_at,
      inflation_adjusted: t.inflation_adjusted,
      label: t.label,
      repeat: t.repeat,
      repeat_unit: t.repeat_unit,
    }
  }

  function spreadInvestment(
    i: EnrichedInvestment | InvestmentNested,
  ): Omit<InvestmentNested, 'transactions'> {
    return {
      id: i.id,
      name: i.name,
      apy: i.apy,
      type: i.type,
      created_at: i.created_at,
      last_edited_at: i.last_edited_at,
      advanced_fees: i.advanced_fees,
      entry_fee: i.entry_fee,
      entry_fee_type: i.entry_fee_type,
      exit_fee: i.exit_fee,
      exit_fee_type: i.exit_fee_type,
      management_fee: i.management_fee,
      management_fee_type: i.management_fee_type,
      success_fee: i.success_fee,
      ter: i.ter,
      goal_data: i.goal_data,
    }
  }

  function spreadPortfolio(
    p: EnrichedPortfolio | PortfolioNested,
  ): Omit<PortfolioNested, 'investments' | 'goals'> {
    return {
      id: p.id,
      name: p.name,
      currency: p.currency,
      start_date: p.start_date,
      end_date: p.end_date,
      inflation_rate: p.inflation_rate,
      created_at: p.created_at,
      last_edited_at: p.last_edited_at,
    }
  }

  return {
    get clients() {
      return clients
    },
    set clients(value: EnrichedClient[]) {
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
      clients = enrichAll(loadData())
      loading = false
    },

    // --- Finders ---

    findClient(id: string): EnrichedClient | undefined {
      return clients.find((c) => c.id === id)
    },

    findPortfolio(portfolioId: string): EnrichedPortfolio | undefined {
      for (const client of clients) {
        const portfolio = client.portfolios.find((p) => p.id === portfolioId)
        if (portfolio) return portfolio
      }
      return undefined
    },

    findInvestment(investmentId: string): EnrichedInvestment | undefined {
      for (const client of clients) {
        for (const portfolio of client.portfolios) {
          const investment = portfolio.investments.find((i) => i.id === investmentId)
          if (investment) return investment
          const goal = portfolio.goals.find((i) => i.id === investmentId)
          if (goal) return goal
        }
      }
      return undefined
    },

    findTransaction(transactionId: string): EnrichedTransaction | undefined {
      for (const client of clients) {
        for (const portfolio of client.portfolios) {
          for (const investment of [...portfolio.investments, ...portfolio.goals]) {
            const transaction = investment.transactions.find((t) => t.id === transactionId)
            if (transaction) return transaction
          }
        }
      }
      return undefined
    },

    getPortfolios(clientId: string): EnrichedPortfolio[] {
      return clients.find((c) => c.id === clientId)?.portfolios ?? []
    },

    getInvestments(portfolioId: string): EnrichedInvestment[] {
      for (const client of clients) {
        const portfolio = client.portfolios.find((p) => p.id === portfolioId)
        if (portfolio) return portfolio.investments
      }
      return []
    },

    getTransactions(investmentId: string): EnrichedTransaction[] {
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
      const enrichedClient = enrichClient(newClient)
      clients.push(enrichedClient)
      persist()
      return id
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
      clients = enrichAll(parsed as ClientNested[])
      loading = false
      persist()
    },
  }
}

export const appStore = withAppStore()
