'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/connection';
import { currencies } from '@/lib/db/schema';
import type { ActionResult } from '@/types/ActionResult';
import { editCurrencySchema } from './editCurrencySchema';

export async function editCurrency(
  id: string,
  data: Partial<{
    name: string;
    symbol: string;
    isActive: boolean;
  }>,
): Promise<ActionResult> {
  const validationResult = editCurrencySchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: `バリデーションエラー: ${validationResult.error.issues.map((i) => i.message).join(', ')}`,
    };
  }

  try {
    await db
      .update(currencies)
      .set({
        ...validationResult.data,
        updatedAt: new Date(),
      })
      .where(eq(currencies.id, id));

    return { success: true };
  } catch (error) {
    console.error('Currency update error:', error);
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
