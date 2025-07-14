import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/connection';
import { currencies } from '@/lib/db/schema';
import { createCurrency } from './createCurrencyAction';

// Mock database
vi.mock('@/lib/db/connection', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(),
    })),
  },
}));

const mockDb = vi.mocked(db);

describe('createCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully creates a currency with valid data', async () => {
    const _mockInsert = vi.fn();
    const mockValues = vi.fn().mockResolvedValue(undefined);

    mockDb.insert.mockReturnValue({
      values: mockValues,
    });

    const currencyData = {
      name: 'ポーカーチップ',
      symbol: 'CHIP',
      isActive: true,
    };

    const result = await createCurrency(currencyData);

    expect(result.success).toBe(true);
    expect(mockDb.insert).toHaveBeenCalledWith(currencies);
    expect(mockValues).toHaveBeenCalledWith(currencyData);
  });

  it('returns validation error for invalid data', async () => {
    const invalidData = {
      name: 'a', // Too short
      symbol: 'abc', // Lowercase
      isActive: true,
    };

    const result = await createCurrency(invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('バリデーションエラー');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('returns error when database operation fails', async () => {
    // コンソールエラーを抑制
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const mockValues = vi
      .fn()
      .mockRejectedValue(new Error('Database connection failed'));

    mockDb.insert.mockReturnValue({
      values: mockValues,
    });

    const currencyData = {
      name: 'ポーカーチップ',
      symbol: 'CHIP',
      isActive: true,
    };

    const result = await createCurrency(currencyData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('データベースエラー');

    // コンソールスパイをリストア
    consoleErrorSpy.mockRestore();
  });

  it('validates name length constraints', async () => {
    const shortNameData = {
      name: 'a',
      symbol: 'CHIP',
      isActive: true,
    };

    const longNameData = {
      name: 'a'.repeat(101),
      symbol: 'CHIP',
      isActive: true,
    };

    const shortResult = await createCurrency(shortNameData);
    const longResult = await createCurrency(longNameData);

    expect(shortResult.success).toBe(false);
    expect(longResult.success).toBe(false);
  });

  it('validates symbol format constraints', async () => {
    const lowercaseSymbolData = {
      name: 'ポーカーチップ',
      symbol: 'chip',
      isActive: true,
    };

    const invalidSymbolData = {
      name: 'ポーカーチップ',
      symbol: 'CH!P',
      isActive: true,
    };

    const lowercaseResult = await createCurrency(lowercaseSymbolData);
    const invalidResult = await createCurrency(invalidSymbolData);

    expect(lowercaseResult.success).toBe(false);
    expect(invalidResult.success).toBe(false);
  });
});
