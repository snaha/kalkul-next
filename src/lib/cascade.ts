import adapters from './adapters'
import { investmentStore } from './stores/investment.svelte'
import { portfolioStore } from './stores/portfolio.svelte'
import { transactionStore } from './stores/transaction.svelte'
import type { InvestmentWithColorIndex, Transaction } from './types'

export async function cascadeDuplicatePortfolio(clientId: string, portfolioId: string) {
	let duplicatedPortfolioId: string | undefined = undefined
	try {
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

		const loading = portfolioStore.loading
		duplicatedPortfolioId = await adapters.addPortfolio(duplicatedPortfolio)
		portfolioStore.loading = loading

		const investments = investmentStore.filter(portfolioId)
		for (const investment of investments) {
			await cascadeDuplicateInvestment(investment, duplicatedPortfolioId)
		}

		portfolioStore.loading = false
		return duplicatedPortfolioId
	} catch (e) {
		if (duplicatedPortfolioId) await adapters.deletePortfolio({ id: duplicatedPortfolioId })
		console.error(e)
		throw e
	}
}

export async function cascadeDuplicateInvestment(
	investment: InvestmentWithColorIndex,
	duplicatedPortfolioId: string,
) {
	let duplicatedInvestmentId: string | undefined = undefined
	try {
		const duplicatedInvestment = {
			...investment,
			id: undefined,
			portfolio_id: duplicatedPortfolioId,
		}
		delete duplicatedInvestment.colorIndex

		const loading = investmentStore.loading
		duplicatedInvestmentId = await adapters.addInvestment(duplicatedInvestment)
		investmentStore.loading = loading

		const transactions = transactionStore.filter(investment.id)
		for (const transaction of transactions) {
			await cascadeDuplicateTransaction(transaction, duplicatedInvestmentId)
		}

		investmentStore.loading = false
		return duplicatedInvestmentId
	} catch (e) {
		if (duplicatedInvestmentId) await adapters.deleteInvestment({ id: duplicatedInvestmentId })
		console.error(e)
		throw e
	}
}

async function cascadeDuplicateTransaction(
	transaction: Transaction,
	duplicatedInvestmentId: string,
) {
	try {
		const duplicatedTransaction = {
			...transaction,
			id: undefined,
			investment_id: duplicatedInvestmentId,
		}
		return await adapters.addTransaction(duplicatedTransaction)
	} catch (e) {
		console.error(e)
		throw e
	}
}
