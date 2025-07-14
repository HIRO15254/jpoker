import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { type NewUser, type User, users } from '@/lib/db/schema/users';
import { createServerSideClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSideClient();

    // 現在のユーザーを取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'ログインが必要です',
        },
        { status: 401 },
      );
    }

    // データベースからユーザー情報を取得
    let dbUser: User | null = null;

    try {
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (existingUsers.length > 0) {
        dbUser = existingUsers[0];
      } else {
        // 初回ログイン時：ユーザーを自動作成
        const newUser: NewUser = {
          id: user.id,
          email: user.email || '',
          username:
            user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          displayName:
            user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatarUrl: user.user_metadata?.avatar_url || null,
        };

        const createdUsers = await db.insert(users).values(newUser).returning();

        dbUser = createdUsers[0];
      }
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'サーバーエラーが発生しました',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      user: dbUser,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'サーバーエラーが発生しました',
      },
      { status: 500 },
    );
  }
}
