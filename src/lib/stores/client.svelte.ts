import type { SvelteSet } from 'svelte/reactivity'
import type {
  ClientNested,
  EnrichedClient,
  EnrichedPortfolio,
  MetaFields,
  Portfolio,
  PortfolioNested,
} from '$lib/types'
import { now } from './store-utils'
import { withPortfolioStore } from './portfolio.svelte'

type AppParent = {
  persist(): void
  deleteClient(id: string): void
  hiddenIds: SvelteSet<string>
}

export type EnrichedClientStore = Omit<ClientNested, 'portfolios'> & {
  portfolios: EnrichedPortfolio[]
  update(updates: Partial<Omit<ClientNested, 'id' | 'created_at' | 'portfolios'>>): void
  delete(): void
  addPortfolio(data: Omit<Portfolio, MetaFields>): string
  deletePortfolio(id: string): void
  duplicatePortfolio(newPortfolio: PortfolioNested): string | undefined
  persist(): void
  hiddenIds: SvelteSet<string>
  toJSON(): ClientNested
}

export function withClientStore(
  client: ClientNested,
  app: AppParent,
): EnrichedClientStore {
  let id = $state(client.id)
  let name = $state(client.name)
  let email = $state(client.email)
  let birth_date = $state(client.birth_date)
  let created_at = $state(client.created_at)
  let portfolios = $state<EnrichedPortfolio[]>([])

  const store: EnrichedClientStore = {
    get id() {
      return id
    },
    set id(v) {
      id = v
    },
    get name() {
      return name
    },
    set name(v) {
      name = v
    },
    get email() {
      return email
    },
    set email(v) {
      email = v
    },
    get birth_date() {
      return birth_date
    },
    set birth_date(v) {
      birth_date = v
    },
    get created_at() {
      return created_at
    },
    set created_at(v) {
      created_at = v
    },
    get portfolios() {
      return portfolios
    },
    set portfolios(v) {
      portfolios = v
    },

    get hiddenIds() {
      return app.hiddenIds
    },

    update(updates: Partial<Omit<ClientNested, 'id' | 'created_at' | 'portfolios'>>) {
      Object.assign(this, updates)
      app.persist()
    },

    delete() {
      app.deleteClient(id)
    },

    addPortfolio(data: Omit<Portfolio, MetaFields>) {
      const portId = crypto.randomUUID()
      const newPortfolio: PortfolioNested = {
        ...data,
        id: portId,
        created_at: now(),
        last_edited_at: now(),
        investments: [],
        goals: [],
      }
      const enrichedPortf = withPortfolioStore(newPortfolio, store)
      portfolios.push(enrichedPortf)
      app.persist()
      return portId
    },

    deletePortfolio(portId: string) {
      const idx = portfolios.findIndex((p) => p.id === portId)
      if (idx !== -1) portfolios.splice(idx, 1)
      app.persist()
    },

    duplicatePortfolio(newPortfolio: PortfolioNested): string | undefined {
      const enrichedPortf = withPortfolioStore(newPortfolio, store)
      portfolios.push(enrichedPortf)
      app.persist()
      return newPortfolio.id
    },

    persist() {
      app.persist()
    },

    toJSON(): ClientNested {
      return {
        id: this.id,
        name: this.name,
        email: this.email,
        birth_date: this.birth_date,
        created_at: this.created_at,
        portfolios: portfolios.map((p) => p.toJSON()),
      }
    },
  }

  // Enrich child portfolios
  portfolios = client.portfolios.map((p) => withPortfolioStore(p, store))

  return store
}
