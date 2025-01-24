import adapters from './adapters'
import { investmentStore } from './stores/investment.svelte'
import { portfolioStore } from './stores/portfolio.svelte'
import { transactionStore } from './stores/transaction.svelte'
import type { InvestmentWithColorIndex, Transaction } from './types'

export async function cascadeDuplicatePortfolio(clientId: number, portfolioId: number) {
	const portfolios = portfolioStore.filter(clientId)
	const originalPortfolio = portfolios.find((portfolio) => portfolio.id === portfolioId)
	if (!originalPortfolio) {
		return
	}

	const duplicatedPortfolio = {
		...originalPortfolio,
		id: undefined,
		link: null,
		name: originalPortfolio.name + ' - Copy',
	}

	const duplicatedPortfolioId = await adapters.addPortfolio(duplicatedPortfolio)

	const investments = investmentStore.filter(portfolioId)
	for (const investment of investments) {
		await cascadeDuplicateInvestment(investment, duplicatedPortfolioId)
	}

	return duplicatedPortfolioId
}

export async function cascadeDuplicateInvestment(
	investment: InvestmentWithColorIndex,
	duplicatedPortfolioId: number,
) {
	const duplicatedInvestment = {
		...investment,
		id: undefined,
		portfolio: duplicatedPortfolioId,
	}
	delete duplicatedInvestment.colorIndex

	const duplicatedInvestmentId = await adapters.addInvestment(duplicatedInvestment)

	const transactions = transactionStore.filter(investment.id)
	for (const transaction of transactions) {
		await cascadeDuplicateTransaction(transaction, duplicatedInvestmentId)
	}
}

async function cascadeDuplicateTransaction(
	transaction: Transaction,
	duplicatedInvestmentId: number,
) {
	const duplicatedTransaction = {
		...transaction,
		id: undefined,
		investment_id: duplicatedInvestmentId,
	}

	await adapters.addTransaction(duplicatedTransaction)
}
