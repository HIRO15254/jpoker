import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const gameStatusEnum = pgEnum('game_status', [
  'waiting',
  'playing',
  'finished',
]);

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  status: gameStatusEnum('status').notNull().default('waiting'),
  maxPlayers: integer('max_players').notNull().default(6),
  currentPlayers: integer('current_players').notNull().default(0),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
