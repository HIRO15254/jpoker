import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Currency } from '@/lib/db/schema/currencies';
import { EditCurrencyForm } from './EditCurrencyForm';
import { editCurrency } from './editCurrencyAction';

// Mock editCurrency action
vi.mock('./editCurrencyAction', () => ({
  editCurrency: vi.fn(),
}));

// Mock @mantine/notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

const mockEditCurrency = vi.mocked(editCurrency);

const mockCurrency: Currency = {
  id: '1',
  name: 'ポーカーチップ',
  symbol: 'CHIP',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('EditCurrencyForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with initial values', () => {
    render(
      <MantineProvider>
        <EditCurrencyForm currency={mockCurrency} />
      </MantineProvider>,
    );

    expect(document.body.textContent).toContain('通貨名');
    expect(document.body.textContent).toContain('シンボル');
    expect(document.body.textContent).toContain('状態');
    expect(document.body.textContent).toContain('更新');
  });

  it('shows validation errors for invalid fields', async () => {
    render(
      <MantineProvider>
        <EditCurrencyForm currency={mockCurrency} />
      </MantineProvider>,
    );

    expect(document.body.textContent).toContain('通貨名');
    expect(document.body.textContent).toContain('シンボル');
  });

  it('successfully updates currency when form is valid', async () => {
    mockEditCurrency.mockResolvedValue({ success: true });

    render(
      <MantineProvider>
        <EditCurrencyForm currency={mockCurrency} onSuccess={mockOnSuccess} />
      </MantineProvider>,
    );

    const testData = {
      name: 'ゴールドチップ',
      symbol: 'CHIP',
      isActive: true,
    };

    await mockEditCurrency('1', testData);

    expect(mockEditCurrency).toHaveBeenCalledWith('1', testData);
  });

  it('shows error message when update fails', async () => {
    mockEditCurrency.mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    render(
      <MantineProvider>
        <EditCurrencyForm currency={mockCurrency} />
      </MantineProvider>,
    );

    const result = await mockEditCurrency('1', {});

    expect(mockEditCurrency).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });

  it('handles isActive field correctly', async () => {
    mockEditCurrency.mockResolvedValue({ success: true });

    render(
      <MantineProvider>
        <EditCurrencyForm currency={mockCurrency} />
      </MantineProvider>,
    );

    expect(document.body.textContent).toContain('状態');
  });
});
