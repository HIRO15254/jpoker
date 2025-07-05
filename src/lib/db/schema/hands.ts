import {
  integer,
  json,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { games } from './games';

export const handStatusEnum = pgEnum('hand_status', [
  'preflop',
  'flop',
  'turn',
  'river',
  'showdown',
  'finished',
]);

export const hands = pgTable('hands', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  handNumber: integer('hand_number').notNull(),
  communityCards: json('community_cards').$type<string[]>().default([]),
  pot: integer('pot').notNull().default(0),
  status: handStatusEnum('status').notNull().default('preflop'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
