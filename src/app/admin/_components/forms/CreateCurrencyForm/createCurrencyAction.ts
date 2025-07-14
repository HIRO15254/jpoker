'use server';

import { db } from '@/lib/db/connection';
import { currencies, type NewCurrency } from '@/lib/db/schema';
import type { ActionResult } from '@/types/ActionResult';
import { createCurrencySchema } from './createCurrencySchema';

export async function createCurrency(data: NewCurrency): ActionResult {
  const validationResult = createCurrencySchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: `バリデーションエラー: ${validationResult.error.issues.join(' ')}`,
    };
  }

  try {
    await db.insert(currencies).values({
      ...validationResult.data,
    });
    return { success: true };
  } catch (error) {
    console.error('Currency creation error:', error);
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
