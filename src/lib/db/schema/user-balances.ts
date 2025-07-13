import { relations } from 'drizzle-orm';
import { bigint, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { currencies } from './currencies';
import { users } from './users';

export const userBalances = pgTable(
  'user_balances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    currencyId: uuid('currency_id')
      .notNull()
      .references(() => currencies.id, { onDelete: 'cascade' }),
    balance: bigint('balance', { mode: 'number' }).default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userCurrencyUnique: unique().on(table.userId, table.currencyId),
  }),
);

export const userBalancesRelations = relations(userBalances, ({ one }) => ({
  user: one(users, {
    fields: [userBalances.userId],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [userBalances.currencyId],
    references: [currencies.id],
  }),
}));

export type UserBalance = typeof userBalances.$inferSelect;
export type NewUserBalance = typeof userBalances.$inferInsert;
