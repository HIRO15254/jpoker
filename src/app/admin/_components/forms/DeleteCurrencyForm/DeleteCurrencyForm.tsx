'use client';

import { Button, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React from 'react';
import type { Currency } from '@/lib/db/schema/currencies';
import { deleteCurrency } from './deleteCurrencyAction';

interface DeleteCurrencyFormProps {
  currency: Currency;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DeleteCurrencyForm({
  currency,
  onSuccess,
  onCancel,
}: DeleteCurrencyFormProps) {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await deleteCurrency(currency.id);

    if (result.success) {
      notifications.show({
        title: '成功',
        message: '通貨を削除しました',
        color: 'green',
      });
      onSuccess?.();
    } else {
      notifications.show({
        title: 'エラー',
        message:
          process.env.NODE_ENV !== 'production'
            ? result.error
            : '通貨の削除に失敗しました',
        color: 'red',
      });
    }
    setLoading(false);
  };

  return (
    <Stack gap="md">
      <Text>
        以下の通貨を削除してもよろしいですか？この操作は取り消せません。
      </Text>
      <Text fw={500} c="red">
        {currency.name} ({currency.symbol})
      </Text>
      <Group justify="flex-end">
        <Button variant="light" onClick={onCancel} disabled={loading}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit} color="red" loading={loading}>
          削除
        </Button>
      </Group>
    </Stack>
  );
}
