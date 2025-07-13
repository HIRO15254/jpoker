'use client';

import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import React from 'react';
import type { Currency } from '@/lib/db/schema/currencies';
import { editCurrency } from './editCurrencyAction';
import { editCurrencySchema } from './editCurrencySchema';

interface EditCurrencyFormProps {
  currency: Currency;
  onSuccess?: () => void;
}

export function EditCurrencyForm({
  currency,
  onSuccess,
}: EditCurrencyFormProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: currency.name,
      symbol: currency.symbol,
      isActive: currency.isActive,
    },
    validate: zod4Resolver(editCurrencySchema),
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    const result = await editCurrency(currency.id, values);

    if (result.success) {
      notifications.show({
        title: '成功',
        message: '通貨を更新しました',
        color: 'green',
      });
      onSuccess?.();
    } else {
      notifications.show({
        title: 'エラー',
        message:
          process.env.NODE_ENV !== 'production'
            ? result.error
            : '通貨の更新に失敗しました',
        color: 'red',
      });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="通貨名"
          placeholder="ポーカーチップ"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <TextInput
          label="シンボル"
          placeholder="C"
          key={form.key('symbol')}
          {...form.getInputProps('symbol')}
        />
        <Select
          label="状態"
          data={[
            { value: 'true', label: 'アクティブ' },
            { value: 'false', label: '無効' },
          ]}
          key={form.key('isActive')}
          value={form.values.isActive?.toString()}
          onChange={(value) => form.setFieldValue('isActive', value === 'true')}
        />
        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            更新
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
