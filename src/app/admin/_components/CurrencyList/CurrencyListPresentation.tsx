'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import type { Currency } from '@/lib/db/schema/currencies';
import { CreateCurrencyForm } from '../forms/CreateCurrencyForm';
import { DeleteCurrencyForm } from '../forms/DeleteCurrencyForm';
import { EditCurrencyForm } from '../forms/EditCurrencyForm';

export interface CurrencyListPresentationProps {
  currencies: Currency[];
}

export const CurrencyListPresentation = ({
  currencies,
}: CurrencyListPresentationProps) => {
  const router = useRouter();
  const handleRefresh = () => {
    router.refresh();
    modals.closeAll();
  };

  const addCurrency = () => {
    modals.open({
      title: '通貨を追加',
      children: <CreateCurrencyForm onSuccess={handleRefresh} />,
    });
  };

  const onEditCurrency = (currency: Currency) => {
    modals.open({
      title: '通貨を編集',
      children: (
        <EditCurrencyForm currency={currency} onSuccess={handleRefresh} />
      ),
    });
  };

  const onDeleteCurrency = (currency: Currency) => {
    modals.open({
      title: '通貨を削除',
      children: (
        <DeleteCurrencyForm
          currency={currency}
          onSuccess={handleRefresh}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>通貨一覧</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={addCurrency}>
          通貨を追加
        </Button>
      </Group>

      <Table>
        <TableThead>
          <TableTr>
            <TableTh>名前</TableTh>
            <TableTh>シンボル</TableTh>
            <TableTh>状態</TableTh>
            <TableTh>作成日</TableTh>
            <TableTh>アクション</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {currencies.map((currency) => (
            <TableTr key={currency.id}>
              <TableTd>{currency.name}</TableTd>
              <TableTd>{currency.symbol}</TableTd>
              <TableTd>
                <Badge color={currency.isActive ? 'green' : 'red'}>
                  {currency.isActive ? 'アクティブ' : '無効'}
                </Badge>
              </TableTd>
              <TableTd>{currency.createdAt.toLocaleDateString()}</TableTd>
              <TableTd>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => onEditCurrency(currency)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => onDeleteCurrency(currency)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Paper>
  );
};
