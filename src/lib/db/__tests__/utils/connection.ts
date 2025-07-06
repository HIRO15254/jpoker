import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

export const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });

export async function testConnection() {
  try {
    await sql`SELECT 1`;
    return { success: true, message: 'データベース接続成功' };
  } catch (error) {
    return {
      success: false,
      message: 'データベース接続失敗',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function closeConnection() {
  await sql.end();
}
