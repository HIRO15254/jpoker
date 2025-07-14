import { describe, expect, it } from 'vitest';
import {
  type NewUserBalance,
  type UserBalance,
  userBalances,
} from '../user-balances';

describe('userBalances schema', () => {
  it('should have correct columns', () => {
    expect(userBalances.id).toBeDefined();
    expect(userBalances.userId).toBeDefined();
    expect(userBalances.currencyId).toBeDefined();
    expect(userBalances.balance).toBeDefined();
    expect(userBalances.createdAt).toBeDefined();
    expect(userBalances.updatedAt).toBeDefined();
  });

  it('should infer correct types', () => {
    const userBalance: UserBalance = {
      id: 'uuid',
      userId: 'user-uuid',
      currencyId: 'currency-uuid',
      balance: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUserBalance: NewUserBalance = {
      userId: 'user-uuid',
      currencyId: 'currency-uuid',
      balance: 1000,
    };

    expect(userBalance).toBeDefined();
    expect(newUserBalance).toBeDefined();
  });
});
