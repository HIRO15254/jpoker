import { mock } from 'bun:test';

// Supabaseクライアントをグローバルにモック
// preloadで実行されるため、すべてのテストで利用可能

const mockGetSession = mock(() =>
  Promise.resolve({ data: { session: null }, error: null }),
);
const mockSignInWithOAuth = mock(() =>
  Promise.resolve({ data: { user: null }, error: null }),
);
const mockSignOut = mock(() => Promise.resolve({ error: null }));
const mockOnAuthStateChange = mock(() => ({
  data: { subscription: { unsubscribe: mock() } },
}));

// Supabaseクライアントオブジェクトを作成
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
    signInWithOAuth: mockSignInWithOAuth,
    signOut: mockSignOut,
    onAuthStateChange: mockOnAuthStateChange,
  },
};

// 様々なパス形式でモック - 現在の作業ディレクトリから解決
mock.module('/mnt/c/Users/hi089/Documents/programs/jpoker/src/lib/auth/supabase.ts', () => ({
  supabase: mockSupabaseClient,
}));

// 相対パス - testディレクトリから見たパス
mock.module('../src/lib/auth/supabase.ts', () => ({
  supabase: mockSupabaseClient,
}));

// srcディレクトリから見たパス  
mock.module('src/lib/auth/supabase.ts', () => ({
  supabase: mockSupabaseClient,
}));

// プロジェクトルートから見たパス
mock.module('./src/lib/auth/supabase.ts', () => ({
  supabase: mockSupabaseClient,
}));

// パスエイリアス
mock.module('@/lib/auth/supabase', () => ({
  supabase: mockSupabaseClient,
}));

// グローバルにモック関数をエクスポート（テストから利用可能）
(globalThis as any).__testMocks = {
  supabase: {
    mockGetSession,
    mockSignInWithOAuth,
    mockSignOut,
    mockOnAuthStateChange,
  },
};