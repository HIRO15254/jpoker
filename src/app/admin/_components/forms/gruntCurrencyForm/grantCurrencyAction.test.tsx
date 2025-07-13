import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/connection';
import { grantCurrency } from './grantCurrencyAction';

// Mock database
vi.mock('@/lib/db/connection', () => ({
  db: {
    transaction: vi.fn(),
  },
}));

const mockDb = vi.mocked(db);

describe('grantCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully grants currency to new user balance', async () => {
    const mockTx = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No existing balance
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    };

    mockDb.transaction.mockImplementation(async (callback) => {
      return await callback(mockTx);
    });

    const grantData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      amount: 1000,
      description: '初回ボーナス',
    };

    const result = await grantCurrency(grantData);

    expect(result.success).toBe(true);
    expect(mockTx.insert).toHaveBeenCalledTimes(2); // userBalances and currencyTransactions
  });

  it('successfully grants currency to existing user balance', async () => {
    const existingBalance = {
      id: '1',
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      balance: 500,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTx = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingBalance]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    };

    mockDb.transaction.mockImplementation(async (callback) => {
      return await callback(mockTx);
    });

    const grantData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      amount: 1000,
      description: '追加ボーナス',
    };

    const result = await grantCurrency(grantData);

    expect(result.success).toBe(true);
    expect(mockTx.update).toHaveBeenCalled();
    expect(mockTx.insert).toHaveBeenCalledTimes(1); // Only currencyTransactions
  });

  it('returns validation error for invalid data', async () => {
    const invalidData = {
      userId: 'invalid-uuid',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      amount: 0, // Invalid amount
      description: 'test',
    };

    const result = await grantCurrency(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('バリデーションエラー');
    }
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  it('returns error when database transaction fails', async () => {
    // コンソールエラーを抑制
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockDb.transaction.mockRejectedValue(
      new Error('Database connection failed'),
    );

    const grantData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      amount: 1000,
      description: '初回ボーナス',
    };

    const result = await grantCurrency(grantData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('データベースエラー');
    }

    // コンソールスパイをリストア
    consoleErrorSpy.mockRestore();
  });

  it('validates amount constraints', async () => {
    const negativeAmountData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      amount: -100,
      description: 'test',
    };

    const tooLargeAmountData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      amount: 2000000,
      description: 'test',
    };

    const negativeResult = await grantCurrency(negativeAmountData);
    const tooLargeResult = await grantCurrency(tooLargeAmountData);

    expect(negativeResult.success).toBe(false);
    expect(tooLargeResult.success).toBe(false);
  });

  it('validates UUID format', async () => {
    const invalidUserIdData = {
      userId: 'invalid-uuid',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      amount: 1000,
      description: 'test',
    };

    const invalidCurrencyIdData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: 'invalid-uuid',
      amount: 1000,
      description: 'test',
    };

    const userIdResult = await grantCurrency(invalidUserIdData);
    const currencyIdResult = await grantCurrency(invalidCurrencyIdData);

    expect(userIdResult.success).toBe(false);
    expect(currencyIdResult.success).toBe(false);
  });

  it('validates description length', async () => {
    const longDescriptionData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1d9d09fe-a745-4add-b00e-61ca140ca688',
      amount: 1000,
      description: 'a'.repeat(256), // Too long
    };

    const result = await grantCurrency(longDescriptionData);

    expect(result.success).toBe(false);
  });
});
