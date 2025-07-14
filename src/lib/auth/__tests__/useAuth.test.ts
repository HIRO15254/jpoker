import type { OAuthResponse, Subscription } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../useAuth';

// Supabaseモジュールをモック
vi.mock('@/lib/supabase/client', () => ({
  createClientSideSupabase: {
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
    const { createClientSideSupabase } = await import('@/lib/supabase/client');

    // デフォルトの戻り値を再設定
    vi.mocked(createClientSideSupabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const oauthResponse: OAuthResponse = {
      data: { provider: 'discord', url: 'https://discord.com/oauth/redirect' },
      error: null,
    };
    vi.mocked(createClientSideSupabase.auth.signInWithOAuth).mockResolvedValue(
      oauthResponse,
    );
    vi.mocked(createClientSideSupabase.auth.signOut).mockResolvedValue({
      error: null,
    });
    const mockSubscription: Subscription = {
      id: 'test-id',
      callback: vi.fn(),
      unsubscribe: vi.fn(),
    };
    vi.mocked(createClientSideSupabase.auth.onAuthStateChange).mockReturnValue({
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
    vi.stubGlobal('location', { origin: 'http://localhost:3000' });

    const { createClientSideSupabase } = await import('@/lib/supabase/client');
    const oauthResponse: OAuthResponse = {
      data: { provider: 'discord', url: 'https://discord.com/oauth/redirect' },
      error: null,
    };
    vi.mocked(
      createClientSideSupabase.auth.signInWithOAuth,
    ).mockResolvedValueOnce(oauthResponse);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithDiscord();
    });

    expect(createClientSideSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'discord',
      options: {
        redirectTo: 'http://localhost:3000',
      },
    });

    // Restore original location
    vi.unstubAllGlobals();
  });

  it('ログアウト機能が正しく動作する', async () => {
    const { createClientSideSupabase } = await import('@/lib/supabase/client');
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(createClientSideSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('認証エラーが適切に処理される', async () => {
    // コンソールエラーを抑制
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.stubGlobal('location', { origin: 'http://localhost:3000' });

    const { createClientSideSupabase } = await import('@/lib/supabase/client');
    const errorMessage = 'OAuth provider error';
    const authError = new AuthError(errorMessage, 400, 'oauth_error');
    const errorResponse: OAuthResponse = {
      data: { provider: 'discord', url: null },
      error: authError,
    };
    vi.mocked(
      createClientSideSupabase.auth.signInWithOAuth,
    ).mockResolvedValueOnce(errorResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithDiscord();
    });

    expect(result.current.error).toBe(errorMessage);

    // コンソールスパイをリストア
    consoleErrorSpy.mockRestore();

    // Restore original location
    vi.unstubAllGlobals();
  });

  it('認証状態の変更が適切に監視される', async () => {
    const { createClientSideSupabase } = await import('@/lib/supabase/client');

    await act(async () => {
      renderHook(() => useAuth());
    });

    expect(createClientSideSupabase.auth.onAuthStateChange).toHaveBeenCalled();
  });
});
