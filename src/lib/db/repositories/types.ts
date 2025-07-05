// 共通の型定義

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// User関連の型定義
export interface CreateUserData {
  username: string;
  email: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  isActive?: boolean;
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  isActive: boolean;
}

// Game関連の型定義
export interface CreateGameData {
  name: string;
  maxPlayers?: number;
  createdBy: string;
}

export interface UpdateGameData {
  name?: string;
  status?: 'waiting' | 'playing' | 'finished';
  maxPlayers?: number;
  currentPlayers?: number;
}

export interface Game extends BaseEntity {
  name: string;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  currentPlayers: number;
  createdBy: string;
}

// Player関連の型定義
export interface CreatePlayerData {
  gameId: string;
  userId: string;
  position: number;
  chips?: number;
}

export interface UpdatePlayerData {
  chips?: number;
  position?: number;
  isActive?: boolean;
}

export interface Player extends BaseEntity {
  gameId: string;
  userId: string;
  chips: number;
  position: number;
  isActive: boolean;
  joinedAt: Date;
}

// Repository共通インターフェース
export interface BaseRepository<T extends BaseEntity, CreateData, UpdateData> {
  create(data: CreateData): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: UpdateData): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  list(options?: PaginationOptions & { sort?: SortOptions }): Promise<T[]>;
  withTransaction<R>(callback: () => Promise<R>): Promise<R>;
}
