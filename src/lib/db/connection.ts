import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 環境変数の検証
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// PostgreSQL クライアントを作成（Supabase公式パターン）
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// データベース接続をテストするユーティリティ関数
export async function testConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// データベース接続を閉じるユーティリティ関数
export async function closeConnection(): Promise<void> {
  await client.end();
}

// 後方互換性のためのエクスポート
export const sql = client;
