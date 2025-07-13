import { db } from '@/lib/db/connection';
import { CurrencyTransactionListPresentation } from './CurrencyTransactionListPresentation';

export async function CurrencyTransactionList() {
  const transactionList = await db.query.currencyTransactions.findMany({
    with: {
      currency: true,
      user: true,
    },
    orderBy: (transaction, { desc }) => {
      return [desc(transaction.createdAt)];
    },
  });

  return <CurrencyTransactionListPresentation transactions={transactionList} />;
}
