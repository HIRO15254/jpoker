import { createClient } from '@supabase/supabase-js';

// 環境変数の検証
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Supabase接続をテストするユーティリティ関数
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('').select('').limit(0);
    return !error;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
}
