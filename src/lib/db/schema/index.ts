// Users

// Games
export { gameStatusEnum, games } from './games';
// Hands
export { handStatusEnum, hands } from './hands';

// Players
export { players } from './players';
export { users } from './users';

// Relations
import { relations } from 'drizzle-orm';
import { games } from './games';
import { hands } from './hands';
import { players } from './players';
import { users } from './users';

export const usersRelations = relations(users, ({ many }) => ({
  createdGames: many(games),
  playerSessions: many(players),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  creator: one(users, {
    fields: [games.createdBy],
    references: [users.id],
  }),
  players: many(players),
  hands: many(hands),
}));

export const playersRelations = relations(players, ({ one }) => ({
  game: one(games, {
    fields: [players.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [players.userId],
    references: [users.id],
  }),
}));

export const handsRelations = relations(hands, ({ one }) => ({
  game: one(games, {
    fields: [hands.gameId],
    references: [games.id],
  }),
}));
