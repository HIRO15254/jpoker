import { describe, expect, it } from 'vitest';
import {
  type CurrencyTransaction,
  currencyTransactions,
  type NewCurrencyTransaction,
  type TransactionType,
  transactionTypes,
} from '../currency-transactions';

describe('currencyTransactions schema', () => {
  it('should have correct columns', () => {
    expect(currencyTransactions.id).toBeDefined();
    expect(currencyTransactions.userId).toBeDefined();
    expect(currencyTransactions.currencyId).toBeDefined();
    expect(currencyTransactions.transactionType).toBeDefined();
    expect(currencyTransactions.amount).toBeDefined();
    expect(currencyTransactions.balanceBefore).toBeDefined();
    expect(currencyTransactions.balanceAfter).toBeDefined();
    expect(currencyTransactions.description).toBeDefined();
    expect(currencyTransactions.referenceId).toBeDefined();
    expect(currencyTransactions.createdAt).toBeDefined();
    expect(currencyTransactions.updatedAt).toBeDefined();
  });

  it('should have correct transaction types', () => {
    expect(transactionTypes).toEqual([
      'ADMIN_GRANT',
      'GAME_BUYIN',
      'GAME_CASHOUT',
    ]);
  });

  it('should infer correct types', () => {
    const transaction: CurrencyTransaction = {
      id: 'uuid',
      userId: 'user-uuid',
      currencyId: 'currency-uuid',
      transactionType: 'ADMIN_GRANT',
      amount: 1000,
      balanceBefore: 0,
      balanceAfter: 1000,
      description: 'Initial grant',
      referenceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newTransaction: NewCurrencyTransaction = {
      userId: 'user-uuid',
      currencyId: 'currency-uuid',
      transactionType: 'GAME_BUYIN',
      amount: -500,
      balanceBefore: 1000,
      balanceAfter: 500,
    };

    const transactionType: TransactionType = 'ADMIN_GRANT';

    expect(transaction).toBeDefined();
    expect(newTransaction).toBeDefined();
    expect(transactionType).toBe('ADMIN_GRANT');
  });
});
