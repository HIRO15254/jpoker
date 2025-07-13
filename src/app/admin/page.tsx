import { Stack, Title } from '@mantine/core';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { CurrencyList } from './_components/CurrencyList';
import { CurrencyTransactionList } from './_components/CurrencyTransactionList';

export default async function AdminPage() {
  const request = new NextRequest('http://localhost:3000/admin');
  const authResult = await requireAdmin(request);

  if (authResult instanceof Response) {
    redirect('/');
  }

  return (
    <Stack gap="lg" p="md">
      <Title order={1}>管理画面</Title>
      <CurrencyList />
      <CurrencyTransactionList />
    </Stack>
  );
}
