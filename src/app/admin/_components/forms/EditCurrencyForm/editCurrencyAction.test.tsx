import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/connection';
import { currencies } from '@/lib/db/schema';
import { editCurrency } from './editCurrencyAction';

// Mock database
vi.mock('@/lib/db/connection', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

const mockDb = vi.mocked(db);

describe('editCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully updates a currency with valid data', async () => {
    const mockWhere = vi.fn().mockResolvedValue(undefined);
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.update.mockReturnValue({ set: mockSet });

    const currencyId = '1';
    const updateData = {
      name: '新しいポーカーチップ',
      symbol: 'NEWCHIP',
      isActive: false,
    };

    const result = await editCurrency(currencyId, updateData);

    expect(result.success).toBe(true);
    expect(mockDb.update).toHaveBeenCalledWith(currencies);
    expect(mockSet).toHaveBeenCalledWith({
      ...updateData,
      updatedAt: expect.any(Date),
    });
    expect(mockWhere).toHaveBeenCalledWith(eq(currencies.id, currencyId));
  });

  it('returns validation error for invalid data', async () => {
    const currencyId = '1';
    const invalidData = {
      name: 'a', // Too short
      symbol: 'abc', // Lowercase
    };

    const result = await editCurrency(currencyId, invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('バリデーションエラー');
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it('returns error when database operation fails', async () => {
    // コンソールエラーを抑制
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockWhere = vi
      .fn()
      .mockRejectedValue(new Error('Database connection failed'));
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.update.mockReturnValue({ set: mockSet });

    const currencyId = '1';
    const updateData = {
      name: 'ポーカーチップ',
      symbol: 'CHIP',
    };

    const result = await editCurrency(currencyId, updateData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('データベースエラー');

    // コンソールスパイをリストア
    consoleErrorSpy.mockRestore();
  });

  it('handles partial updates correctly', async () => {
    const mockWhere = vi.fn().mockResolvedValue(undefined);
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.update.mockReturnValue({ set: mockSet });

    const currencyId = '1';
    const partialData = {
      name: '新しい名前',
    };

    const result = await editCurrency(currencyId, partialData);

    expect(result.success).toBe(true);
    expect(mockSet).toHaveBeenCalledWith({
      name: '新しい名前',
      updatedAt: expect.any(Date),
    });
  });

  it('validates name length constraints', async () => {
    const currencyId = '1';

    const shortNameData = { name: 'a' };
    const longNameData = { name: 'a'.repeat(101) };

    const shortResult = await editCurrency(currencyId, shortNameData);
    const longResult = await editCurrency(currencyId, longNameData);

    expect(shortResult.success).toBe(false);
    expect(longResult.success).toBe(false);
  });

  it('validates symbol format constraints', async () => {
    const currencyId = '1';

    const lowercaseSymbolData = { symbol: 'chip' };
    const invalidSymbolData = { symbol: 'CH!P' };

    const lowercaseResult = await editCurrency(currencyId, lowercaseSymbolData);
    const invalidResult = await editCurrency(currencyId, invalidSymbolData);

    expect(lowercaseResult.success).toBe(false);
    expect(invalidResult.success).toBe(false);
  });
});
