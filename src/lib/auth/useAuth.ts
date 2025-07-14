'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { revalidateAuthState } from '../actions/auth';
import { createClientSideSupabase } from '../supabase/client';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // セッションの初期化
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await createClientSideSupabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        setError('セッションの取得に失敗しました');
        console.error('Session error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // 認証状態の監視
    const {
      data: { subscription },
    } = createClientSideSupabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setError(null);
        setIsLoading(false);

        // 認証状態が変更された際にサーバーコンポーネントを再検証
        try {
          await revalidateAuthState();
        } catch (error) {
          console.error('Failed to revalidate auth state:', error);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithDiscord = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { error } = await createClientSideSupabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (err) {
      console.error('Discord sign in error:', err);
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { error } = await createClientSideSupabase.auth.signOut();

      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (err) {
      console.error('Sign out error:', err);
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    signInWithDiscord,
    signOut,
  };
}
