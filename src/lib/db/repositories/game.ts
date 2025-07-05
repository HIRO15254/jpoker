import { eq } from 'drizzle-orm';
import { games, players } from '../schema';
import { AbstractRepository } from './base';
import type {
  CreateGameData,
  CreatePlayerData,
  Game,
  UpdateGameData,
} from './types';

export class GameRepository extends AbstractRepository<
  Game,
  CreateGameData,
  UpdateGameData
> {
  get table() {
    return games;
  }

  mapToEntity(raw: any): Game {
    return {
      id: raw.id,
      name: raw.name,
      status: raw.status,
      maxPlayers: raw.maxPlayers,
      currentPlayers: raw.currentPlayers,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  mapFromCreateData(data: CreateGameData): any {
    return {
      name: data.name,
      maxPlayers: data.maxPlayers || 6,
      currentPlayers: 0,
      createdBy: data.createdBy,
      status: 'waiting',
    };
  }

  mapFromUpdateData(data: UpdateGameData): any {
    const mapped: any = {};
    if (data.name !== undefined) mapped.name = data.name;
    if (data.status !== undefined) mapped.status = data.status;
    if (data.maxPlayers !== undefined) mapped.maxPlayers = data.maxPlayers;
    if (data.currentPlayers !== undefined)
      mapped.currentPlayers = data.currentPlayers;
    return mapped;
  }

  // Game固有のメソッド
  async findByStatus(
    status: 'waiting' | 'playing' | 'finished',
  ): Promise<Game[]> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.status, status));

      return result.map((row: any) => this.mapToEntity(row));
    } catch (error) {
      console.error('Error finding games by status:', error);
      return [];
    }
  }

  async findByCreator(creatorId: string): Promise<Game[]> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.createdBy, creatorId));

      return result.map((row: any) => this.mapToEntity(row));
    } catch (error) {
      console.error('Error finding games by creator:', error);
      return [];
    }
  }

  async addPlayer(
    gameId: string,
    playerData: CreatePlayerData,
  ): Promise<boolean> {
    try {
      // プレイヤーを追加
      await this.db.insert(players).values({
        gameId: playerData.gameId,
        userId: playerData.userId,
        position: playerData.position,
        chips: playerData.chips || 1000,
        isActive: true,
      });

      // ゲームの現在プレイヤー数を更新
      const game = await this.findById(gameId);
      if (game) {
        await this.update(gameId, {
          currentPlayers: game.currentPlayers + 1,
        });
      }

      return true;
    } catch (error) {
      console.error('Error adding player to game:', error);
      return false;
    }
  }

  async removePlayer(gameId: string, userId: string): Promise<boolean> {
    try {
      // プレイヤーを削除
      const result = await this.db
        .delete(players)
        .where(eq(players.gameId, gameId) && eq(players.userId, userId))
        .returning();

      if (result.length > 0) {
        // ゲームの現在プレイヤー数を更新
        const game = await this.findById(gameId);
        if (game && game.currentPlayers > 0) {
          await this.update(gameId, {
            currentPlayers: game.currentPlayers - 1,
          });
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error removing player from game:', error);
      return false;
    }
  }

  async canJoinGame(gameId: string): Promise<boolean> {
    const game = await this.findById(gameId);
    return (
      game !== null &&
      game.status === 'waiting' &&
      game.currentPlayers < game.maxPlayers
    );
  }

  async startGame(gameId: string): Promise<boolean> {
    const game = await this.findById(gameId);
    if (game && game.status === 'waiting' && game.currentPlayers >= 2) {
      const updated = await this.update(gameId, { status: 'playing' });
      return updated !== null;
    }
    return false;
  }

  async finishGame(gameId: string): Promise<boolean> {
    const updated = await this.update(gameId, { status: 'finished' });
    return updated !== null;
  }
}
