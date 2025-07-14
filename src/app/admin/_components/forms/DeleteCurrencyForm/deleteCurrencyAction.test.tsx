import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/connection';
import { currencies } from '@/lib/db/schema';
import { deleteCurrency } from './deleteCurrencyAction';

// Mock database
vi.mock('@/lib/db/connection', () => ({
  db: {
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  },
}));

const mockDb = vi.mocked(db);

describe('deleteCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully deletes a currency with valid ID', async () => {
    const mockWhere = vi.fn().mockResolvedValue(undefined);
    mockDb.delete.mockReturnValue({ where: mockWhere });

    const currencyId = '1';
    const result = await deleteCurrency(currencyId);

    expect(result.success).toBe(true);
    expect(mockDb.delete).toHaveBeenCalledWith(currencies);
    expect(mockWhere).toHaveBeenCalledWith(eq(currencies.id, currencyId));
  });

  it('returns error when ID is not provided', async () => {
    const result = await deleteCurrency('');

    expect(result.success).toBe(false);
    expect(result.error).toBe('IDが指定されていません');
    expect(mockDb.delete).not.toHaveBeenCalled();
  });

  it('returns error when database operation fails', async () => {
    // コンソールエラーを抑制
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockWhere = vi
      .fn()
      .mockRejectedValue(new Error('Foreign key constraint'));
    mockDb.delete.mockReturnValue({ where: mockWhere });

    const currencyId = '1';
    const result = await deleteCurrency(currencyId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('データベースエラー');

    // コンソールスパイをリストア
    consoleErrorSpy.mockRestore();
  });

  it('handles foreign key constraint errors', async () => {
    // コンソールエラーを抑制
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const foreignKeyError = new Error('Foreign key constraint violation');
    const mockWhere = vi.fn().mockRejectedValue(foreignKeyError);
    mockDb.delete.mockReturnValue({ where: mockWhere });

    const currencyId = '1';
    const result = await deleteCurrency(currencyId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Foreign key constraint violation');

    // コンソールスパイをリストア
    consoleErrorSpy.mockRestore();
  });

  it('handles unknown errors gracefully', async () => {
    // コンソールエラーを抑制
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const mockWhere = vi.fn().mockRejectedValue('Unknown error');
    mockDb.delete.mockReturnValue({ where: mockWhere });

    const currencyId = '1';
    const result = await deleteCurrency(currencyId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('不明なエラーが発生しました');

    // コンソールスパイをリストア
    consoleErrorSpy.mockRestore();
  });
});
