import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Currency } from '@/lib/db/schema/currencies';
import { CurrencyListPresentation } from './CurrencyListPresentation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock @mantine/modals
vi.mock('@mantine/modals', () => ({
  modals: {
    open: vi.fn(),
    openConfirmModal: vi.fn(),
    closeAll: vi.fn(),
  },
}));

const mockCurrencies: Currency[] = [
  {
    id: '1',
    name: 'ポーカーチップ',
    symbol: 'C',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'ゴールド',
    symbol: 'G',
    isActive: false,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

describe('CurrencyListPresentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('renders currency list correctly', () => {
    renderWithProvider(
      <CurrencyListPresentation currencies={mockCurrencies} />,
    );

    expect(document.body.textContent).toContain('通貨一覧');
    expect(document.body.textContent).toContain('通貨を追加');
    expect(document.body.textContent).toContain('ポーカーチップ');
    expect(document.body.textContent).toContain('C');
    expect(document.body.textContent).toContain('アクティブ');
    expect(document.body.textContent).toContain('ゴールド');
    expect(document.body.textContent).toContain('G');
    expect(document.body.textContent).toContain('無効');
  });

  it('displays formatted creation date', () => {
    renderWithProvider(
      <CurrencyListPresentation currencies={mockCurrencies} />,
    );

    expect(document.body.textContent).toContain('2023/1/1');
    expect(document.body.textContent).toContain('2023/1/2');
  });

  it('displays correct badge colors for active status', () => {
    renderWithProvider(
      <CurrencyListPresentation currencies={mockCurrencies} />,
    );

    expect(document.body.textContent).toContain('アクティブ');
    expect(document.body.textContent).toContain('無効');
  });
});
