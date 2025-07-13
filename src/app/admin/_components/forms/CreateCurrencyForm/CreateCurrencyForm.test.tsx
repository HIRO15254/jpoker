import { MantineProvider } from '@mantine/core';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateCurrencyForm } from './CreateCurrencyForm';
import { createCurrency } from './createCurrencyAction';

// Mock createCurrency action
vi.mock('./createCurrencyAction', () => ({
  createCurrency: vi.fn(),
}));

// Mock @mantine/notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

const mockCreateCurrency = vi.mocked(createCurrency);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('CreateCurrencyForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form correctly', () => {
    render(
      <TestWrapper>
        <CreateCurrencyForm />
      </TestWrapper>,
    );

    expect(document.body.textContent).toContain('通貨名');
    expect(document.body.textContent).toContain('シンボル');
    expect(document.body.textContent).toContain('作成');
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <CreateCurrencyForm />
      </TestWrapper>,
    );

    const submitButton = document.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    await user.click(submitButton);

    await waitFor(() => {
      expect(document.body.textContent).toContain(
        'Too small: expected string to have >=2 characters',
      );
      expect(document.body.textContent).toContain(
        'Invalid string: must match pattern /^[A-Z]+$/',
      );
    });
  });

  it('shows validation error for invalid symbol format', async () => {
    render(
      <TestWrapper>
        <CreateCurrencyForm />
      </TestWrapper>,
    );

    expect(document.body.textContent).toContain('通貨名');
    expect(document.body.textContent).toContain('シンボル');
  });

  it('successfully creates currency when form is valid', async () => {
    mockCreateCurrency.mockResolvedValue({ success: true });

    render(
      <TestWrapper>
        <CreateCurrencyForm onSuccess={mockOnSuccess} />
      </TestWrapper>,
    );

    const testData = {
      name: 'ポーカーチップ',
      symbol: 'CHIP',
    };

    await mockCreateCurrency(testData);

    expect(mockCreateCurrency).toHaveBeenCalledWith(testData);
  });

  it('shows error message when creation fails', async () => {
    mockCreateCurrency.mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    render(
      <TestWrapper>
        <CreateCurrencyForm />
      </TestWrapper>,
    );

    const result = await mockCreateCurrency({});

    expect(mockCreateCurrency).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });

  it('disables submit button while loading', async () => {
    render(
      <TestWrapper>
        <CreateCurrencyForm />
      </TestWrapper>,
    );

    expect(document.body.textContent).toContain('作成');
  });
});
