import { sql as drizzleSql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { users } from '../schema';
import { closeConnection, db, testConnection } from './utils/connection';

const isCI = process.env.CI === 'true';

describe.skipIf(isCI)('Database Connection', () => {
  afterAll(async () => {
    await closeConnection();
  });

  it('should connect to database successfully', async () => {
    const result = await testConnection();
    expect(result.success).toBe(true);
    expect(result.message).toBe('データベース接続成功');
  });

  it('should execute simple query with drizzle', async () => {
    const result = await db.execute(drizzleSql.raw('SELECT 1 as test'));
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].test).toBe(1);
  });

  it('should have drizzle database instance', () => {
    expect(db).toBeDefined();
    expect(typeof db.select).toBe('function');
    expect(typeof db.insert).toBe('function');
    expect(typeof db.update).toBe('function');
    expect(typeof db.delete).toBe('function');
  });

  it('should have schema loaded', () => {
    expect(db.query).toBeDefined();
    expect(db.query.users).toBeDefined();
  });

  it('should handle connection errors gracefully', async () => {
    // テスト用に無効な接続文字列を作成
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = await import('postgres');

    const invalidSql = postgres.default(
      'postgresql://invalid:invalid@localhost:9999/invalid',
    );
    const invalidDb = drizzle(invalidSql);

    try {
      await invalidDb.execute('SELECT 1');
      expect(true).toBe(false); // この行に到達すべきでない
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      await invalidSql.end();
    }
  });

  it('should check if users table exists using drizzle', async () => {
    const result = await db.execute(
      drizzleSql.raw(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `),
    );
    expect(result[0].exists).toBe(true);
  });

  it('should be able to query users table with drizzle', async () => {
    const result = await db.select().from(users).limit(1);
    expect(Array.isArray(result)).toBe(true);
  });
});
