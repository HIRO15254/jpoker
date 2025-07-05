import { and, eq } from 'drizzle-orm';
import { players } from '../schema';
import { AbstractRepository } from './base';
import type { CreatePlayerData, Player, UpdatePlayerData } from './types';

export class PlayerRepository extends AbstractRepository<
  Player,
  CreatePlayerData,
  UpdatePlayerData
> {
  get table() {
    return players;
  }

  mapToEntity(raw: any): Player {
    return {
      id: raw.id,
      gameId: raw.gameId,
      userId: raw.userId,
      chips: raw.chips,
      position: raw.position,
      isActive: raw.isActive,
      joinedAt: raw.joinedAt,
      createdAt: raw.joinedAt, // joinedAtをcreatedAtとして使用
      updatedAt: raw.updatedAt || raw.joinedAt,
    };
  }

  mapFromCreateData(data: CreatePlayerData): any {
    return {
      gameId: data.gameId,
      userId: data.userId,
      position: data.position,
      chips: data.chips || 1000,
      isActive: true,
    };
  }

  mapFromUpdateData(data: UpdatePlayerData): any {
    const mapped: any = {};
    if (data.chips !== undefined) mapped.chips = data.chips;
    if (data.position !== undefined) mapped.position = data.position;
    if (data.isActive !== undefined) mapped.isActive = data.isActive;
    return mapped;
  }

  // Player固有のメソッド
  async findByGame(gameId: string): Promise<Player[]> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.gameId, gameId));

      return result.map((row: any) => this.mapToEntity(row));
    } catch (error) {
      console.error('Error finding players by game:', error);
      return [];
    }
  }

  async findByUser(userId: string): Promise<Player[]> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.userId, userId));

      return result.map((row: any) => this.mapToEntity(row));
    } catch (error) {
      console.error('Error finding players by user:', error);
      return [];
    }
  }

  async findByGameAndUser(
    gameId: string,
    userId: string,
  ): Promise<Player | null> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(
          and(eq(this.table.gameId, gameId), eq(this.table.userId, userId)),
        )
        .limit(1);

      return result.length > 0 ? this.mapToEntity(result[0]) : null;
    } catch (error) {
      console.error('Error finding player by game and user:', error);
      return null;
    }
  }

  async updateChips(playerId: string, newChipAmount: number): Promise<boolean> {
    try {
      const result = await this.update(playerId, { chips: newChipAmount });
      return result !== null;
    } catch (error) {
      console.error('Error updating player chips:', error);
      return false;
    }
  }

  async setActive(playerId: string, isActive: boolean): Promise<boolean> {
    try {
      const result = await this.update(playerId, { isActive });
      return result !== null;
    } catch (error) {
      console.error('Error setting player active status:', error);
      return false;
    }
  }

  async getActivePlayers(gameId: string): Promise<Player[]> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(
          and(eq(this.table.gameId, gameId), eq(this.table.isActive, true)),
        );

      return result.map((row: any) => this.mapToEntity(row));
    } catch (error) {
      console.error('Error getting active players:', error);
      return [];
    }
  }

  async isUserInGame(gameId: string, userId: string): Promise<boolean> {
    const player = await this.findByGameAndUser(gameId, userId);
    return player !== null;
  }

  async getPlayerCount(gameId: string): Promise<number> {
    try {
      const players = await this.findByGame(gameId);
      return players.length;
    } catch (error) {
      console.error('Error getting player count:', error);
      return 0;
    }
  }

  async transferChips(
    fromPlayerId: string,
    toPlayerId: string,
    amount: number,
  ): Promise<boolean> {
    try {
      return await this.withTransaction(async () => {
        const fromPlayer = await this.findById(fromPlayerId);
        const toPlayer = await this.findById(toPlayerId);

        if (!fromPlayer || !toPlayer || fromPlayer.chips < amount) {
          return false;
        }

        const fromUpdated = await this.updateChips(
          fromPlayerId,
          fromPlayer.chips - amount,
        );
        const toUpdated = await this.updateChips(
          toPlayerId,
          toPlayer.chips + amount,
        );

        return fromUpdated && toUpdated;
      });
    } catch (error) {
      console.error('Error transferring chips:', error);
      return false;
    }
  }
}
