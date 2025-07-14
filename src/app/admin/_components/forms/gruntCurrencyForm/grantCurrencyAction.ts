'use server';

import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/connection';
import { currencyTransactions, userBalances } from '@/lib/db/schema';
import type { ActionResult } from '@/types/ActionResult';
import { grantCurrencySchema } from './grantCurrencySchema';

export async function grantCurrency(data: {
  userId: string;
  currencyId: string;
  amount: number;
  description?: string;
}): Promise<Awaited<ActionResult>> {
  const validationResult = grantCurrencySchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: `バリデーションエラー: ${validationResult.error.issues.map((i) => i.message).join(', ')}`,
    };
  }

  const { userId, currencyId, amount, description } = validationResult.data;

  try {
    await db.transaction(async (tx) => {
      // 現在の残高を取得
      const existingBalance = await tx
        .select()
        .from(userBalances)
        .where(
          and(
            eq(userBalances.userId, userId),
            eq(userBalances.currencyId, currencyId),
          ),
        )
        .limit(1);

      let balanceBefore = 0;
      let balanceAfter = amount;

      if (existingBalance.length > 0) {
        balanceBefore = existingBalance[0].balance;
        balanceAfter = balanceBefore + amount;

        // 残高を更新
        await tx
          .update(userBalances)
          .set({
            balance: balanceAfter,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userBalances.userId, userId),
              eq(userBalances.currencyId, currencyId),
            ),
          );
      } else {
        // 新しい残高レコードを作成
        await tx.insert(userBalances).values({
          userId,
          currencyId,
          balance: balanceAfter,
        });
      }

      // トランザクション履歴を記録
      await tx.insert(currencyTransactions).values({
        userId,
        currencyId,
        transactionType: 'ADMIN_GRANT',
        amount,
        balanceBefore,
        balanceAfter,
        description: description || '管理者による通貨付与',
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Currency grant error:', error);
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
