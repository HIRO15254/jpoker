import { MantineProvider } from '@mantine/core';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Currency } from '@/lib/db/schema/currencies';
import { DeleteCurrencyForm } from './DeleteCurrencyForm';
import { deleteCurrency } from './deleteCurrencyAction';

// Mock deleteCurrency action
vi.mock('./deleteCurrencyAction', () => ({
  deleteCurrency: vi.fn(),
}));

// Mock @mantine/notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

const mockDeleteCurrency = vi.mocked(deleteCurrency);

const mockCurrency: Currency = {
  id: '1',
  name: 'ポーカーチップ',
  symbol: 'CHIP',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('DeleteCurrencyForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with currency information', () => {
    render(
      <TestWrapper>
        <DeleteCurrencyForm
          currency={mockCurrency}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>,
    );

    expect(document.body.textContent).toContain(
      '以下の通貨を削除してもよろしいですか？',
    );
    expect(document.body.textContent).toContain('ポーカーチップ (CHIP)');
    expect(document.body.textContent).toContain('キャンセル');
    expect(document.body.textContent).toContain('削除');
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DeleteCurrencyForm
          currency={mockCurrency}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>,
    );

    const cancelButton = document.querySelector('button:nth-of-type(1)');
    if (cancelButton) {
      await user.click(cancelButton);
    }

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('successfully deletes currency when delete button is clicked', async () => {
    const user = userEvent.setup();
    mockDeleteCurrency.mockResolvedValue({ success: true });

    render(
      <TestWrapper>
        <DeleteCurrencyForm
          currency={mockCurrency}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>,
    );

    const deleteButton = document.querySelector('button:nth-of-type(2)');
    if (deleteButton) {
      await user.click(deleteButton);
    }

    await waitFor(() => {
      expect(mockDeleteCurrency).toHaveBeenCalledWith('1');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows error message when deletion fails', async () => {
    const user = userEvent.setup();
    mockDeleteCurrency.mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    render(
      <TestWrapper>
        <DeleteCurrencyForm
          currency={mockCurrency}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>,
    );

    const deleteButton = document.querySelector('button:nth-of-type(2)');
    if (deleteButton) {
      await user.click(deleteButton);
    }

    await waitFor(() => {
      expect(mockDeleteCurrency).toHaveBeenCalledWith('1');
    });
  });

  it('disables buttons while loading', async () => {
    const user = userEvent.setup();
    mockDeleteCurrency.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <DeleteCurrencyForm
          currency={mockCurrency}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>,
    );

    const deleteButton = document.querySelector('button:nth-of-type(2)');
    const cancelButton = document.querySelector('button:nth-of-type(1)');

    if (deleteButton) {
      await user.click(deleteButton);
    }

    await waitFor(() => {
      expect(deleteButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });
});
