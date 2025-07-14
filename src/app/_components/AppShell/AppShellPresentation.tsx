'use client';

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Box,
  Burger,
  Button,
  Group,
  NavLink,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname, useRouter } from 'next/navigation';
import React, { type ReactNode } from 'react';
import { signOut as serverSignOut } from '@/lib/actions/auth';
import type { User } from '@/lib/auth/getCurrentUser';
import { useAuth } from '@/lib/auth/useAuth';

interface AppShellPresentationProps {
  user: User | null;
  children: ReactNode;
}

export function AppShellPresentation({
  user,
  children,
}: AppShellPresentationProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const { signInWithDiscord, signOut } = useAuth();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleDiscordSignIn = async () => {
    try {
      await signInWithDiscord();
    } catch (err) {
      console.error('Discord login failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      // Server Actionを使用してログアウトとrevalidatePathを実行
      await serverSignOut();
    } catch (err) {
      console.error('Logout failed:', err);
      // フォールバック: クライアントサイドでログアウト
      try {
        await signOut();
      } catch (fallbackErr) {
        console.error('Fallback logout failed:', fallbackErr);
      }
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShellHeader>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              aria-label="toggle navigation"
            />
            <Text fw={500}>Poker App</Text>
          </Group>

          <Group>
            {user ? (
              <Group>
                <Text size="sm">{user.name}</Text>
                <Button variant="subtle" onClick={handleSignOut}>
                  ログアウト
                </Button>
              </Group>
            ) : (
              <Button
                variant="subtle"
                onClick={handleDiscordSignIn}
                leftSection="🎮"
              >
                Discordでログイン
              </Button>
            )}
          </Group>
        </Group>
      </AppShellHeader>

      <AppShellNavbar p="md" data-hidden={mobileOpened ? 'false' : 'true'}>
        <Box>
          <NavLink
            label="ホーム"
            onClick={() => handleNavigate('/')}
            aria-current={pathname === '/' ? 'page' : undefined}
            active={pathname === '/'}
          />

          {user && (
            <NavLink
              label="プロフィール"
              onClick={() => handleNavigate('/profile')}
              aria-current={pathname === '/profile' ? 'page' : undefined}
              active={pathname === '/profile'}
            />
          )}

          {user?.isAdmin && (
            <NavLink
              label="管理画面"
              onClick={() => handleNavigate('/admin')}
              aria-current={pathname === '/admin' ? 'page' : undefined}
              active={pathname === '/admin'}
            />
          )}

          {!user && (
            <NavLink label="Discordでログイン" onClick={handleDiscordSignIn} />
          )}
        </Box>
      </AppShellNavbar>

      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
