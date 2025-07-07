import type { OAuthResponse, Subscription } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../useAuth';

// Supabaseモジュールをモック
vi.mock('@/lib/auth/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(async () => {
    // 各テスト前にモック関数の履歴をクリア
    vi.clearAllMocks();

    // supabaseモックを取得
    const { supabase } = await import('@/lib/auth/supabase');

    // デフォルトの戻り値を再設定
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const oauthResponse: OAuthResponse = {
      data: { provider: 'discord', url: 'https://discord.com/oauth/redirect' },
      error: null,
    };
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue(oauthResponse);
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
    const mockSubscription: Subscription = {
      id: 'test-id',
      callback: vi.fn(),
      unsubscribe: vi.fn(),
    };
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: mockSubscription },
    });
  });

  it('初期状態で認証されていない', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      // 初期化を待つ
    });

    // 初期状態では認証されていない（ローディング状態は実装による）
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('Discord OAuthログイン機能が正しく動作する', async () => {
    // window.location.originをモック
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    const { supabase } = await import('@/lib/auth/supabase');
    const oauthResponse: OAuthResponse = {
      data: { provider: 'discord', url: 'https://discord.com/oauth/redirect' },
      error: null,
    };
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce(
      oauthResponse,
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithDiscord();
    });

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'discord',
      options: {
        redirectTo: 'http://localhost:3000',
      },
    });
  });

  it('ログアウト機能が正しく動作する', async () => {
    const { supabase } = await import('@/lib/auth/supabase');
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('認証エラーが適切に処理される', async () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    const { supabase } = await import('@/lib/auth/supabase');
    const errorMessage = 'OAuth provider error';
    const authError = new AuthError(errorMessage, 400, 'oauth_error');
    const errorResponse: OAuthResponse = {
      data: { provider: 'discord', url: null },
      error: authError,
    };
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce(
      errorResponse,
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithDiscord();
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('認証状態の変更が適切に監視される', async () => {
    const { supabase } = await import('@/lib/auth/supabase');

    await act(async () => {
      renderHook(() => useAuth());
    });

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });
});
