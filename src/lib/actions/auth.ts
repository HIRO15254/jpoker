'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSideClient } from '@/lib/supabase/server';

/**
 * ログアウト処理を行うServer Action
 */
export async function signOut() {
  const supabase = await createServerSideClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // ログアウト後はすべてのページを再検証
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }

  // ログアウト後はホームページにリダイレクト
  redirect('/');
}

/**
 * 認証状態が変更された際の汎用的な再検証
 */
export async function revalidateAuthState() {
  // 認証状態に依存するすべてのページを再検証
  revalidatePath('/', 'layout');
}
