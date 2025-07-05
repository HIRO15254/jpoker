import { describe, expect, it } from 'bun:test';
import { games, hands, players, users } from './schema';

describe('Database Schema', () => {
  describe('Users Table', () => {
    it('ユーザーテーブルが定義されている', () => {
      expect(users).toBeDefined();
      expect(users.id).toBeDefined();
      expect(users.username).toBeDefined();
      expect(users.email).toBeDefined();
      expect(users.createdAt).toBeDefined();
      expect(users.updatedAt).toBeDefined();
    });

    it('ユーザーテーブルのカラム名が正しい', () => {
      expect(users.id.name).toBe('id');
      expect(users.username.name).toBe('username');
      expect(users.email.name).toBe('email');
      expect(users.createdAt.name).toBe('created_at');
      expect(users.updatedAt.name).toBe('updated_at');
    });
  });

  describe('Games Table', () => {
    it('ゲームテーブルが定義されている', () => {
      expect(games).toBeDefined();
      expect(games.id).toBeDefined();
      expect(games.name).toBeDefined();
      expect(games.status).toBeDefined();
      expect(games.maxPlayers).toBeDefined();
      expect(games.currentPlayers).toBeDefined();
      expect(games.createdBy).toBeDefined();
      expect(games.createdAt).toBeDefined();
      expect(games.updatedAt).toBeDefined();
    });

    it('ゲームテーブルのカラム名が正しい', () => {
      expect(games.id.name).toBe('id');
      expect(games.name.name).toBe('name');
      expect(games.status.name).toBe('status');
      expect(games.maxPlayers.name).toBe('max_players');
      expect(games.currentPlayers.name).toBe('current_players');
      expect(games.createdBy.name).toBe('created_by');
    });
  });

  describe('Players Table', () => {
    it('プレイヤーテーブルが定義されている', () => {
      expect(players).toBeDefined();
      expect(players.id).toBeDefined();
      expect(players.gameId).toBeDefined();
      expect(players.userId).toBeDefined();
      expect(players.chips).toBeDefined();
      expect(players.position).toBeDefined();
      expect(players.isActive).toBeDefined();
      expect(players.joinedAt).toBeDefined();
    });

    it('プレイヤーテーブルのカラム名が正しい', () => {
      expect(players.id.name).toBe('id');
      expect(players.gameId.name).toBe('game_id');
      expect(players.userId.name).toBe('user_id');
      expect(players.chips.name).toBe('chips');
      expect(players.position.name).toBe('position');
      expect(players.isActive.name).toBe('is_active');
      expect(players.joinedAt.name).toBe('joined_at');
    });
  });

  describe('Hands Table', () => {
    it('ハンドテーブルが定義されている', () => {
      expect(hands).toBeDefined();
      expect(hands.id).toBeDefined();
      expect(hands.gameId).toBeDefined();
      expect(hands.handNumber).toBeDefined();
      expect(hands.communityCards).toBeDefined();
      expect(hands.pot).toBeDefined();
      expect(hands.status).toBeDefined();
      expect(hands.createdAt).toBeDefined();
      expect(hands.updatedAt).toBeDefined();
    });

    it('ハンドテーブルのカラム名が正しい', () => {
      expect(hands.id.name).toBe('id');
      expect(hands.gameId.name).toBe('game_id');
      expect(hands.handNumber.name).toBe('hand_number');
      expect(hands.communityCards.name).toBe('community_cards');
      expect(hands.pot.name).toBe('pot');
      expect(hands.status.name).toBe('status');
    });
  });

  describe('Schema Integration', () => {
    it('全てのテーブルが正しくエクスポートされている', () => {
      expect(users).toBeDefined();
      expect(games).toBeDefined();
      expect(players).toBeDefined();
      expect(hands).toBeDefined();
    });
  });
});
