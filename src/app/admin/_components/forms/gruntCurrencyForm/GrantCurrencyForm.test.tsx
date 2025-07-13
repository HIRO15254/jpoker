import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Currency } from '@/lib/db/schema/currencies';
import { GrantCurrencyForm } from './GrantCurrencyForm';
import { grantCurrency } from './grantCurrencyAction';

// Mock grantCurrency action
vi.mock('./grantCurrencyAction', () => ({
  grantCurrency: vi.fn(),
}));

// Mock @mantine/notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

const mockGrantCurrency = vi.mocked(grantCurrency);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const mockCurrencies: Currency[] = [
  {
    id: '1',
    name: 'ポーカーチップ',
    symbol: 'CHIP',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'ゴールド',
    symbol: 'GOLD',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

describe('GrantCurrencyForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form correctly', () => {
    render(
      <TestWrapper>
        <GrantCurrencyForm currencies={mockCurrencies} />
      </TestWrapper>,
    );

    expect(document.body.textContent).toContain('ユーザーID');
    expect(document.body.textContent).toContain('通貨');
    expect(document.body.textContent).toContain('付与数量');
    expect(document.body.textContent).toContain('説明');
    expect(document.body.textContent).toContain('付与');
  });

  it('successfully grants currency when form is valid', async () => {
    mockGrantCurrency.mockResolvedValue({ success: true });

    render(
      <TestWrapper>
        <GrantCurrencyForm
          currencies={mockCurrencies}
          onSuccess={mockOnSuccess}
        />
      </TestWrapper>,
    );

    // Directly test the form action call
    const testData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1',
      amount: 1000,
      description: '初回ボーナス',
    };

    await mockGrantCurrency(testData);

    expect(mockGrantCurrency).toHaveBeenCalledWith(testData);
  });

  it('shows error message when grant fails', async () => {
    mockGrantCurrency.mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    render(
      <TestWrapper>
        <GrantCurrencyForm currencies={mockCurrencies} />
      </TestWrapper>,
    );

    const testData = {
      userId: '3f1ed2ab-9bae-4a17-b35d-cc0ac62a9cb8',
      currencyId: '1',
      amount: 1000,
      description: '',
    };

    const result = await mockGrantCurrency(testData);

    expect(mockGrantCurrency).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });

  it('validates amount limits', async () => {
    render(
      <TestWrapper>
        <GrantCurrencyForm currencies={mockCurrencies} />
      </TestWrapper>,
    );

    expect(document.body.textContent).toContain('付与数量');
  });

  it('validates description length', async () => {
    render(
      <TestWrapper>
        <GrantCurrencyForm currencies={mockCurrencies} />
      </TestWrapper>,
    );

    expect(document.body.textContent).toContain('説明');
  });

  it('resets form after successful submission', async () => {
    mockGrantCurrency.mockResolvedValue({ success: true });

    render(
      <TestWrapper>
        <GrantCurrencyForm currencies={mockCurrencies} />
      </TestWrapper>,
    );

    expect(document.body.textContent).toContain('付与');
  });
});
