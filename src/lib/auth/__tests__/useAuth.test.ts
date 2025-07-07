import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';

// 直接モックを作成
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

// useAuthテストで直接モジュールをモック
mock.module('@/lib/auth/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    // 各テスト前にモック関数の履歴をクリア
    mockGetSession.mockClear();
    mockSignInWithOAuth.mockClear();
    mockSignOut.mockClear();
    mockOnAuthStateChange.mockClear();
    
    // デフォルトの戻り値を再設定
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSignInWithOAuth.mockResolvedValue({ data: { user: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: () => {} } },
    });
  });

  it('初期状態で認証されていない', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('Discord OAuthログイン機能が正しく動作する', async () => {
    // window.location.originをモック
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    const mockUser = { id: '1', email: 'test@example.com' };
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithDiscord();
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'discord',
      options: {
        redirectTo: 'http://localhost:3000',
      },
    });
  });

  it('ログアウト機能が正しく動作する', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('認証エラーが適切に処理される', async () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    const errorMessage = 'OAuth provider error';
    const mockErrorResponse = { message: errorMessage };
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { user: null },
      error: mockErrorResponse,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithDiscord();
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('認証状態の変更が適切に監視される', () => {
    renderHook(() => useAuth());
    
    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });
});