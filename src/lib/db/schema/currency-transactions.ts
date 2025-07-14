import { relations } from 'drizzle-orm';
import {
  bigint,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { currencies } from './currencies';
import { users } from './users';

export const transactionTypes = [
  'ADMIN_GRANT',
  'GAME_BUYIN',
  'GAME_CASHOUT',
] as const;

export const currencyTransactions = pgTable('currency_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  currencyId: uuid('currency_id')
    .notNull()
    .references(() => currencies.id, { onDelete: 'cascade' }),
  transactionType: varchar('transaction_type', { length: 20 }).notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  balanceBefore: bigint('balance_before', { mode: 'number' }).notNull(),
  balanceAfter: bigint('balance_after', { mode: 'number' }).notNull(),
  description: text('description'),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const currencyTransactionsRelations = relations(
  currencyTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [currencyTransactions.userId],
      references: [users.id],
    }),
    currency: one(currencies, {
      fields: [currencyTransactions.currencyId],
      references: [currencies.id],
    }),
  }),
);

export type CurrencyTransaction = typeof currencyTransactions.$inferSelect;
export type NewCurrencyTransaction = typeof currencyTransactions.$inferInsert;
export type TransactionType = (typeof transactionTypes)[number];
