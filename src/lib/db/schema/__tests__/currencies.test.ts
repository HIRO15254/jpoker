import { describe, expect, it } from 'vitest';
import { type Currency, currencies, type NewCurrency } from '../currencies';

describe('currencies schema', () => {
  it('should have correct columns', () => {
    expect(currencies.id).toBeDefined();
    expect(currencies.name).toBeDefined();
    expect(currencies.symbol).toBeDefined();
    expect(currencies.isActive).toBeDefined();
    expect(currencies.createdAt).toBeDefined();
    expect(currencies.updatedAt).toBeDefined();
  });

  it('should infer correct types', () => {
    const currency: Currency = {
      id: 'uuid',
      name: 'ポーカーチップ',
      symbol: 'C',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newCurrency: NewCurrency = {
      name: 'ポーカーチップ',
      symbol: 'C',
    };

    expect(currency).toBeDefined();
    expect(newCurrency).toBeDefined();
  });
});
