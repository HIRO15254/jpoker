'use client';

import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import React from 'react';
import type { NewCurrency } from '@/lib/db/schema';
import { createCurrency } from './createCurrencyAction';
import { createCurrencySchema } from './createCurrencySchema';

interface CreateCurrencyFormProps {
  onSuccess?: () => void;
}

export function CreateCurrencyForm({ onSuccess }: CreateCurrencyFormProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<NewCurrency>({
    mode: 'uncontrolled',
    initialValues: {
      symbol: '',
      name: '',
    },
    validate: zod4Resolver(createCurrencySchema),
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    createCurrency(values).then((result) => {
      if (result.success) {
        form.reset();
        notifications.show({
          title: '成功',
          message: '通貨を作成しました',
          color: 'green',
        });
        onSuccess?.();
      } else {
        notifications.show({
          title: 'エラー',
          message:
            process.env.NODE_ENV !== 'production'
              ? result.error
              : '通貨の作成に失敗しました',
          color: 'red',
        });
      }
      setLoading(false);
    });
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
        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            作成
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
