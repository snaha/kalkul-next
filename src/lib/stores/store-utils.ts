import type {
  EnrichedInvestment,
  EnrichedPortfolio,
  EnrichedTransaction,
  InvestmentNested,
  PortfolioNested,
  Transaction,
} from '$lib/types'

export function spreadTransaction(t: EnrichedTransaction | Transaction): Transaction {
  return {
    id: t.id,
    amount: t.amount,
    date: t.date,
    end_date: t.end_date,
    type: t.type,
    inflation_adjusted: t.inflation_adjusted,
    label: t.label,
    repeat: t.repeat,
    repeat_unit: t.repeat_unit,
  }
}

export function spreadInvestment(
  i: EnrichedInvestment | InvestmentNested,
): Omit<InvestmentNested, 'transactions'> {
  return {
    id: i.id,
    name: i.name,
    apy: i.apy,
    type: i.type,
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

export function spreadPortfolio(
  p: EnrichedPortfolio | PortfolioNested,
): Omit<PortfolioNested, 'investments' | 'goals'> {
  return {
    id: p.id,
    name: p.name,
    currency: p.currency,
    start_date: p.start_date,
    end_date: p.end_date,
    inflation_rate: p.inflation_rate,
  }
}
