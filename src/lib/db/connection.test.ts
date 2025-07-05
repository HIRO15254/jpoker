import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { closeConnection, db, testConnection } from './connection';

describe('Database Connection', () => {
  beforeAll(async () => {
    // テスト前にNODE_ENVをtestに設定
    process.env.NODE_ENV = 'test';

    // テスト用のダミーDATABASE_URLを設定（実際のテストでは適切なテストDBを使用）
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL =
        'postgresql://test:test@localhost:5432/test_db';
    }
  });

  afterAll(async () => {
    // テスト後は接続を閉じる
    try {
      await closeConnection();
    } catch (_error) {
      // 接続が既に閉じられている場合は無視
    }
  });

  it('データベース接続設定が正しく読み込まれる', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(db).toBeDefined();
  });

  it('testConnection関数が定義されている', () => {
    expect(typeof testConnection).toBe('function');
  });

  it('closeConnection関数が定義されている', () => {
    expect(typeof closeConnection).toBe('function');
  });

  // 注意: 実際のデータベース接続テストは実際のDBが利用可能な場合のみ実行
  it('データベース接続テストが適切にエラーハンドリングを行う', async () => {
    // この段階では実際のDBがないため、接続は失敗することを期待
    const result = await testConnection();
    expect(typeof result).toBe('boolean');
  });
});
