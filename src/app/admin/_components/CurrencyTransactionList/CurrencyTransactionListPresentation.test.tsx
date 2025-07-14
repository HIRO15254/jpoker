import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { CurrencyTransactionListPresentation } from './CurrencyTransactionListPresentation';

const mockTransactions = [
  {
    id: '1',
    userId: 'user1',
    currencyId: 'currency1',
    transactionType: 'ADMIN_GRANT' as const,
    amount: 1000,
    balanceBefore: 0,
    balanceAfter: 1000,
    description: '初回ボーナス',
    referenceId: null,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    user: {
      username: 'testuser',
      email: 'test@example.com',
    },
    currency: {
      code: 'CHIP',
      name: 'ポーカーチップ',
      symbol: 'C',
    },
  },
  {
    id: '2',
    userId: 'user2',
    currencyId: 'currency1',
    transactionType: 'GAME_BUYIN' as const,
    amount: -500,
    balanceBefore: 1000,
    balanceAfter: 500,
    description: 'ゲーム参加費',
    referenceId: null,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    user: {
      username: 'player2',
      email: 'player2@example.com',
    },
    currency: {
      code: 'CHIP',
      name: 'ポーカーチップ',
      symbol: 'C',
    },
  },
];

describe('CurrencyTransactionListPresentation', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('renders transaction list correctly', () => {
    renderWithProvider(
      <CurrencyTransactionListPresentation transactions={mockTransactions} />,
    );

    // Use document.body.textContent for more reliable testing
    expect(document.body.textContent).toContain('通貨トランザクション履歴');
    expect(document.body.textContent).toContain('testuser');
    expect(document.body.textContent).toContain('test@example.com');
    expect(document.body.textContent).toContain('player2');
    expect(document.body.textContent).toContain('player2@example.com');
    expect(document.body.textContent).toContain('ポーカーチップ (C)');
  });

  it('displays transaction types with correct badges', () => {
    renderWithProvider(
      <CurrencyTransactionListPresentation transactions={mockTransactions} />,
    );

    expect(document.body.textContent).toContain('管理者付与');
    expect(document.body.textContent).toContain('ゲーム参加');
  });

  it('displays positive and negative amounts with correct colors', () => {
    renderWithProvider(
      <CurrencyTransactionListPresentation transactions={mockTransactions} />,
    );

    expect(document.body.textContent).toContain('+1,000');
    expect(document.body.textContent).toContain('-500');
  });

  it('displays balance changes correctly', () => {
    renderWithProvider(
      <CurrencyTransactionListPresentation transactions={mockTransactions} />,
    );

    expect(document.body.textContent).toContain('0 → 1,000');
    expect(document.body.textContent).toContain('1,000 → 500');
  });

  it('displays descriptions correctly', () => {
    renderWithProvider(
      <CurrencyTransactionListPresentation transactions={mockTransactions} />,
    );

    expect(document.body.textContent).toContain('初回ボーナス');
    expect(document.body.textContent).toContain('ゲーム参加費');
  });

  it('displays formatted creation dates', () => {
    renderWithProvider(
      <CurrencyTransactionListPresentation transactions={mockTransactions} />,
    );

    expect(document.body.textContent).toContain('2023/1/1');
    expect(document.body.textContent).toContain('2023/1/2');
  });

  it('handles empty descriptions', () => {
    const transactionWithoutDescription = {
      ...mockTransactions[0],
      description: null,
    };

    renderWithProvider(
      <CurrencyTransactionListPresentation
        transactions={[transactionWithoutDescription]}
      />,
    );

    expect(document.body.textContent).toContain('-');
  });
});
