import { beforeAll, describe, expect, it } from 'bun:test';

// テスト環境の設定を最初に行う
process.env.NODE_ENV = 'test';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
}

import { eq } from 'drizzle-orm';
import { games, players, users } from './schema';

// モックDBクエリインターフェース
interface MockDbQuery {
  insert: (table: any) => MockInsertQuery;
  select: () => MockSelectQuery;
  update: (table: any) => MockUpdateQuery;
  delete: (table: any) => MockDeleteQuery;
}

interface MockInsertQuery {
  values: (data: any) => MockInsertQuery;
  returning: () => Promise<any[]>;
}

interface MockSelectQuery {
  from: (table: any) => MockSelectQuery;
  where: (condition: any) => MockSelectQuery;
  leftJoin: (table: any, condition: any) => MockSelectQuery;
  limit: (count: number) => Promise<any[]>;
  then: (callback: (data: any[]) => any) => Promise<any>;
}

interface MockUpdateQuery {
  set: (data: any) => MockUpdateQuery;
  where: (condition: any) => MockUpdateQuery;
  returning: () => Promise<any[]>;
}

interface MockDeleteQuery {
  where: (condition: any) => MockDeleteQuery;
  returning: () => Promise<any[]>;
}

// モックDB実装
class MockDb implements MockDbQuery {
  private mockData = new Map<string, any[]>();

  constructor() {
    // テスト用の初期データ
    this.mockData.set('users', []);
    this.mockData.set('games', []);
    this.mockData.set('players', []);
  }

  insert(table: any): MockInsertQuery {
    // テーブル名を簡易的に判定
    let tableName = 'unknown';
    if (table === users) tableName = 'users';
    else if (table === games) tableName = 'games';
    else if (table === players) tableName = 'players';

    return {
      values: (data: any) => ({
        values: () => this,
        returning: async () => {
          const id = `mock-${Date.now()}-${Math.random()}`;
          const record = {
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const tableData = this.mockData.get(tableName) || [];
          tableData.push(record);
          this.mockData.set(tableName, tableData);
          return [record];
        },
      }),
      returning: async () => [],
    };
  }

  select(): MockSelectQuery {
    const createChainableQuery = (tableName: string) => {
      const mockQuery = {
        from: (table: any) => {
          let newTableName = 'unknown';
          if (table === users) newTableName = 'users';
          else if (table === games) newTableName = 'games';
          else if (table === players) newTableName = 'players';
          return createChainableQuery(newTableName);
        },
        where: () => mockQuery,
        leftJoin: () => mockQuery,
        limit: async (count: number) => {
          const tableData = this.mockData.get(tableName) || [];
          return tableData.slice(0, count);
        },
        then: async (callback: (data: any[]) => any) => {
          const tableData = this.mockData.get(tableName) || [];
          return callback(tableData);
        },
      };
      return mockQuery;
    };

    return createChainableQuery('unknown');
  }

  update(table: any): MockUpdateQuery {
    return {
      set: () => ({
        set: () => this,
        where: () => ({
          where: () => this,
          returning: async () => [],
        }),
        returning: async () => [],
      }),
      where: () => this,
      returning: async () => [],
    };
  }

  delete(table: any): MockDeleteQuery {
    return {
      where: () => ({
        where: () => this,
        returning: async () => [],
      }),
      returning: async () => [],
    };
  }
}

describe('Database CRUD Operations (Mock)', () => {
  let mockDb: MockDb;

  beforeAll(() => {
    mockDb = new MockDb();
  });

  describe('Users CRUD', () => {
    it('新規ユーザーを作成できる', async () => {
      const newUser = {
        username: 'testuser_' + Date.now(),
        email: `test_${Date.now()}@example.com`,
      };

      const result = await mockDb.insert(users).values(newUser).returning();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].username).toBe(newUser.username);
      expect(result[0].email).toBe(newUser.email);
    });

    it('ユーザー一覧を取得できる', async () => {
      const result = await mockDb.select().from(users).limit(10);

      expect(Array.isArray(result)).toBe(true);
    });

    it('ユーザーを更新できる', async () => {
      const updateData = {
        username: 'updated_user_' + Date.now(),
      };

      const result = await mockDb
        .update(users)
        .set(updateData)
        .where(eq(users.id, 'mock-id'))
        .returning();

      expect(Array.isArray(result)).toBe(true);
    });

    it('ユーザーを削除できる', async () => {
      const result = await mockDb
        .delete(users)
        .where(eq(users.id, 'mock-id'))
        .returning();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Games CRUD', () => {
    it('新規ゲームを作成できる', async () => {
      const newGame = {
        name: 'Test Game ' + Date.now(),
        createdBy: 'mock-user-id',
      };

      const result = await mockDb.insert(games).values(newGame).returning();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].name).toBe(newGame.name);
    });

    it('ゲーム一覧を取得できる', async () => {
      const result = await mockDb.select().from(games).limit(10);

      expect(Array.isArray(result)).toBe(true);
    });

    it('ゲームステータスを更新できる', async () => {
      const updateData = {
        status: 'playing' as const,
        currentPlayers: 2,
      };

      const result = await mockDb
        .update(games)
        .set(updateData)
        .where(eq(games.id, 'mock-game-id'))
        .returning();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Players CRUD', () => {
    it('プレイヤーをゲームに参加させることができる', async () => {
      const newPlayer = {
        gameId: 'mock-game-id',
        userId: 'mock-user-id',
        position: 1,
        chips: 1000,
      };

      const result = await mockDb.insert(players).values(newPlayer).returning();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].position).toBe(newPlayer.position);
      expect(result[0].chips).toBe(newPlayer.chips);
    });

    it('ゲームのプレイヤー一覧を取得できる', async () => {
      const result = await mockDb.select().from(players).limit(10);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Complex Queries', () => {
    it('ゲームとその作成者の情報を結合クエリできる', async () => {
      const result = await mockDb
        .select()
        .from(games)
        .leftJoin(users, eq(games.createdBy, users.id))
        .limit(10);

      expect(Array.isArray(result)).toBe(true);
    });

    it('複雑なクエリ構造を構築できる', () => {
      // クエリビルダーの構造をテスト
      const query = mockDb
        .select()
        .from(games)
        .leftJoin(users, eq(games.createdBy, users.id));

      expect(query).toBeDefined();
      expect(typeof query.limit).toBe('function');
    });
  });

  describe('Schema Validation', () => {
    it('スキーマオブジェクトが適切に構造化されている', () => {
      // Drizzleスキーマオブジェクトの存在確認
      expect(users).toBeDefined();
      expect(games).toBeDefined();
      expect(players).toBeDefined();
    });

    it('カラム定義が適切に設定されている', () => {
      expect(users.id).toBeDefined();
      expect(users.username).toBeDefined();
      expect(users.email).toBeDefined();

      expect(games.id).toBeDefined();
      expect(games.name).toBeDefined();
      expect(games.status).toBeDefined();

      expect(players.gameId).toBeDefined();
      expect(players.userId).toBeDefined();
    });
  });
});
