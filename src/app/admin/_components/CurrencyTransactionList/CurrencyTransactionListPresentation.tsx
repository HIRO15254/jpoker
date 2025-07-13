import {
  Badge,
  Group,
  Paper,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from '@mantine/core';
import React from 'react';
import type { CurrencyTransaction } from '@/lib/db/schema/currency-transactions';

interface CurrencyTransactionWithDetails extends CurrencyTransaction {
  user: {
    username: string;
    email: string;
  };
  currency: {
    name: string;
    symbol: string;
  };
}

interface CurrencyTransactionListPresentationProps {
  transactions: CurrencyTransactionWithDetails[];
}

export const CurrencyTransactionListPresentation = ({
  transactions,
}: CurrencyTransactionListPresentationProps) => {
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN_GRANT':
        return 'green';
      case 'GAME_BUYIN':
        return 'red';
      case 'GAME_CASHOUT':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'ADMIN_GRANT':
        return '管理者付与';
      case 'GAME_BUYIN':
        return 'ゲーム参加';
      case 'GAME_CASHOUT':
        return 'ゲーム精算';
      default:
        return type;
    }
  };

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>通貨トランザクション履歴</Title>
      </Group>

      <Table>
        <TableThead>
          <TableTr>
            <TableTh>ユーザー</TableTh>
            <TableTh>通貨</TableTh>
            <TableTh>トランザクション種別</TableTh>
            <TableTh>金額</TableTh>
            <TableTh>残高変動</TableTh>
            <TableTh>説明</TableTh>
            <TableTh>作成日</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {transactions.map((transaction) => (
            <TableTr key={transaction.id}>
              <TableTd>
                <div>
                  <Text size="sm" fw={500}>
                    {transaction.user.username}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {transaction.user.email}
                  </Text>
                </div>
              </TableTd>
              <TableTd>
                {transaction.currency.name} ({transaction.currency.symbol})
              </TableTd>
              <TableTd>
                <Badge
                  color={getTransactionTypeColor(transaction.transactionType)}
                >
                  {getTransactionTypeLabel(transaction.transactionType)}
                </Badge>
              </TableTd>
              <TableTd>
                <Text c={transaction.amount >= 0 ? 'green' : 'red'}>
                  {transaction.amount >= 0 ? '+' : ''}
                  {transaction.amount.toLocaleString('ja-JP')}
                </Text>
              </TableTd>
              <TableTd>
                <Text size="sm" c="dimmed">
                  {`${transaction.balanceBefore.toLocaleString('ja-JP')} → ${transaction.balanceAfter.toLocaleString('ja-JP')}`}
                </Text>
              </TableTd>
              <TableTd>
                <Text size="sm">{transaction.description || '-'}</Text>
              </TableTd>
              <TableTd>
                {transaction.createdAt.toLocaleDateString('ja-JP')}
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Paper>
  );
};
