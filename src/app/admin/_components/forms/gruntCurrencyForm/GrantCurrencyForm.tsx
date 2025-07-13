'use client';

import {
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import React from 'react';
import type { Currency } from '@/lib/db/schema/currencies';
import { grantCurrency } from './grantCurrencyAction';
import { grantCurrencySchema } from './grantCurrencySchema';

interface GrantCurrencyFormProps {
  currencies: Currency[];
  onSuccess?: () => void;
}

export function GrantCurrencyForm({
  currencies,
  onSuccess,
}: GrantCurrencyFormProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      userId: '',
      currencyId: '',
      amount: 0,
      description: '',
    },
    validate: zod4Resolver(grantCurrencySchema),
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    const result = await grantCurrency(values);

    if (result.success) {
      form.reset();
      notifications.show({
        title: '成功',
        message: '通貨を付与しました',
        color: 'green',
      });
      onSuccess?.();
    } else {
      notifications.show({
        title: 'エラー',
        message:
          process.env.NODE_ENV !== 'production'
            ? result.error
            : '通貨付与に失敗しました',
        color: 'red',
      });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="ユーザーID"
          placeholder="ユーザーIDを入力"
          key={form.key('userId')}
          {...form.getInputProps('userId')}
        />
        <Select
          label="通貨"
          placeholder="通貨を選択"
          data={currencies.map((c) => ({
            value: c.id,
            label: `${c.name} (${c.symbol})`,
          }))}
          key={form.key('currencyId')}
          {...form.getInputProps('currencyId')}
        />
        <NumberInput
          label="付与数量"
          placeholder="1000"
          min={1}
          max={1000000}
          key={form.key('amount')}
          {...form.getInputProps('amount')}
        />
        <TextInput
          label="説明"
          placeholder="初回ボーナス"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />
        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            付与
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
