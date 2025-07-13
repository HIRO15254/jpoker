'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/connection';
import { currencies } from '@/lib/db/schema';
import type { ActionResult } from '@/types/ActionResult';

export async function deleteCurrency(id: string): ActionResult {
  if (!id) {
    return {
      success: false,
      error: 'IDが指定されていません',
    };
  }

  try {
    await db.delete(currencies).where(eq(currencies.id, id));

    return { success: true };
  } catch (error) {
    console.error('Currency deletion error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: `データベースエラー: ${error.message}`,
      };
    }
    return {
      success: false,
      error: '不明なエラーが発生しました',
    };
  }
}
