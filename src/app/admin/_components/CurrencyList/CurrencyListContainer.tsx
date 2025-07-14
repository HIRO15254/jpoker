import React from 'react';
import { db } from '@/lib/db/connection';
import { CurrencyListPresentation } from './CurrencyListPresentation';
import 'server-only';

export const CurrencyList: React.FC = async () => {
  const currencyList = await db.query.currencies.findMany({
    orderBy: (currencies, { desc }) => [desc(currencies.createdAt)],
  });

  return <CurrencyListPresentation currencies={currencyList} />;
};
