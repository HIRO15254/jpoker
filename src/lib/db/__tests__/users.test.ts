import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test';
import { eq, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { type NewUser, users } from '../schema';

const isCI = process.env.CI === 'true';

describe.skipIf(isCI)('Users CRUD Operations', () => {
  let testUserId: string;
  let sql: postgres.Sql;
  let db: ReturnType<typeof drizzle>;

  beforeAll(async () => {
    // テスト専用の接続を作成
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
    sql = postgres(connectionString);
    db = drizzle(sql, { schema: { users } });

    // テスト用データベースの準備
    await sql`DELETE FROM users WHERE email LIKE 'test%'`;
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await sql`DELETE FROM users WHERE email LIKE 'test%'`;
    await sql.end();
  });

  beforeEach(async () => {
    // 各テスト前にテストデータをクリーンアップ
    await sql`DELETE FROM users WHERE email LIKE 'test%'`;
  });

  describe('Create User', () => {
    it('should create a new user', async () => {
      const newUser: NewUser = {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const result = await db.insert(users).values(newUser).returning();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe(newUser.email);
      expect(result[0].username).toBe(newUser.username);
      expect(result[0].displayName).toBe(newUser.displayName || null);
      expect(result[0].avatarUrl).toBe(newUser.avatarUrl || null);
      expect(result[0].id).toBeDefined();
      expect(result[0].createdAt).toBeDefined();
      expect(result[0].updatedAt).toBeDefined();

      testUserId = result[0].id;
    });

    it('should create a user with minimal fields', async () => {
      const newUser: NewUser = {
        email: 'test-minimal@example.com',
        username: 'testminimal',
      };

      const result = await db.insert(users).values(newUser).returning();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe(newUser.email);
      expect(result[0].username).toBe(newUser.username);
      expect(result[0].displayName).toBeNull();
      expect(result[0].avatarUrl).toBeNull();
    });

    it('should fail to create user with duplicate email', async () => {
      const newUser: NewUser = {
        email: 'test-duplicate@example.com',
        username: 'testdup1',
      };

      await db.insert(users).values(newUser);

      const duplicateUser: NewUser = {
        email: 'test-duplicate@example.com',
        username: 'testdup2',
      };

      try {
        await db.insert(users).values(duplicateUser);
        expect(true).toBe(false); // この行に到達すべきでない
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should fail to create user with duplicate username', async () => {
      const newUser: NewUser = {
        email: 'test-dup-username1@example.com',
        username: 'testdupusername',
      };

      await db.insert(users).values(newUser);

      const duplicateUser: NewUser = {
        email: 'test-dup-username2@example.com',
        username: 'testdupusername',
      };

      try {
        await db.insert(users).values(duplicateUser);
        expect(true).toBe(false); // この行に到達すべきでない
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Read User', () => {
    beforeEach(async () => {
      const newUser: NewUser = {
        email: 'test-read@example.com',
        username: 'testread',
        displayName: 'Test Read User',
      };
      const result = await db.insert(users).values(newUser).returning();
      testUserId = result[0].id;
    });

    it('should find user by id', async () => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testUserId);
      expect(result[0].email).toBe('test-read@example.com');
      expect(result[0].username).toBe('testread');
    });

    it('should find user by email', async () => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, 'test-read@example.com'));

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testUserId);
      expect(result[0].email).toBe('test-read@example.com');
    });

    it('should find user by username', async () => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, 'testread'));

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testUserId);
      expect(result[0].username).toBe('testread');
    });

    it('should return empty array for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, nonExistentId));

      expect(result).toHaveLength(0);
    });
  });

  describe('Update User', () => {
    beforeEach(async () => {
      const newUser: NewUser = {
        email: 'test-update@example.com',
        username: 'testupdate',
        displayName: 'Test Update User',
      };
      const result = await db.insert(users).values(newUser).returning();
      testUserId = result[0].id;
    });

    it('should update user display name', async () => {
      const updatedDisplayName = 'Updated Display Name';

      const result = await db
        .update(users)
        .set({ displayName: updatedDisplayName, updatedAt: new Date() })
        .where(eq(users.id, testUserId))
        .returning();

      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe(updatedDisplayName);
      expect(result[0].email).toBe('test-update@example.com');
    });

    it('should update user avatar URL', async () => {
      const avatarUrl = 'https://example.com/new-avatar.jpg';

      const result = await db
        .update(users)
        .set({ avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, testUserId))
        .returning();

      expect(result).toHaveLength(1);
      expect(result[0].avatarUrl).toBe(avatarUrl);
    });

    it('should update multiple fields', async () => {
      const updates = {
        displayName: 'Multi Update User',
        avatarUrl: 'https://example.com/multi-avatar.jpg',
        updatedAt: new Date(),
      };

      const result = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, testUserId))
        .returning();

      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe(updates.displayName);
      expect(result[0].avatarUrl).toBe(updates.avatarUrl);
    });
  });

  describe('Delete User', () => {
    beforeEach(async () => {
      const newUser: NewUser = {
        email: 'test-delete@example.com',
        username: 'testdelete',
        displayName: 'Test Delete User',
      };
      const result = await db.insert(users).values(newUser).returning();
      testUserId = result[0].id;
    });

    it('should delete user by id', async () => {
      const result = await db
        .delete(users)
        .where(eq(users.id, testUserId))
        .returning();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testUserId);

      // 削除されたことを確認
      const checkResult = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));
      expect(checkResult).toHaveLength(0);
    });

    it('should return empty array when deleting non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const result = await db
        .delete(users)
        .where(eq(users.id, nonExistentId))
        .returning();

      expect(result).toHaveLength(0);
    });
  });

  describe('Query Multiple Users', () => {
    beforeEach(async () => {
      const testUsers: NewUser[] = [
        {
          email: 'test-multi1@example.com',
          username: 'testmulti1',
          displayName: 'Multi User 1',
        },
        {
          email: 'test-multi2@example.com',
          username: 'testmulti2',
          displayName: 'Multi User 2',
        },
        {
          email: 'test-multi3@example.com',
          username: 'testmulti3',
          displayName: 'Multi User 3',
        },
      ];

      await db.insert(users).values(testUsers);
    });

    it('should retrieve all test users', async () => {
      const result = await db
        .select()
        .from(users)
        .where(like(users.email, 'test-multi%'));

      expect(result).toHaveLength(3);
      expect(result.map((u) => u.username).sort()).toEqual([
        'testmulti1',
        'testmulti2',
        'testmulti3',
      ]);
    });

    it('should limit query results', async () => {
      const result = await db
        .select()
        .from(users)
        .where(like(users.email, 'test-multi%'))
        .limit(2);

      expect(result).toHaveLength(2);
    });

    it('should order results by username', async () => {
      const result = await db
        .select()
        .from(users)
        .where(like(users.email, 'test-multi%'))
        .orderBy(users.username);

      expect(result).toHaveLength(3);
      expect(result[0].username).toBe('testmulti1');
      expect(result[1].username).toBe('testmulti2');
      expect(result[2].username).toBe('testmulti3');
    });
  });
});
