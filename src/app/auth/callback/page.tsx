'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { createClientSideSupabase } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('認証処理中...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClientSideSupabase;

        // まず現在のセッション状態を確認
        const { data: currentSession } = await supabase.auth.getSession();

        if (currentSession.session) {
          setStatus('ログイン成功！リダイレクト中...');

          const redirectTo = searchParams.get('redirect') || '/';
          setTimeout(() => router.push(redirectTo), 1000);
          return;
        }

        // URLから認証コードを取得
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const error_param = url.searchParams.get('error');

        if (error_param) {
          setStatus(`認証エラー: ${error_param}`);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (!code) {
          setStatus('認証コードが見つかりません');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        // URLから認証コードを処理
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) {
          setStatus(`認証に失敗しました: ${error.message}`);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (data.session) {
          setStatus('ログイン成功！リダイレクト中...');

          // リダイレクト先を取得
          const redirectTo = searchParams.get('redirect') || '/';

          setTimeout(() => {
            router.push(redirectTo);
          }, 1000);
        } else {
          setStatus('セッションの作成に失敗しました');
          setTimeout(() => router.push('/login'), 3000);
        }
      } catch (error) {
        setStatus(`予期しないエラー: ${error}`);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div>{status}</div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
