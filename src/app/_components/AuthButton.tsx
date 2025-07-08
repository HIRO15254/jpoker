'use client';

import { Alert, Button, Group, Text } from '@mantine/core';
import React from 'react';
import { useAuth } from '@/lib/auth/useAuth';

export function AuthButton() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    signInWithDiscord,
    signOut,
  } = useAuth();

  const handleDiscordSignIn = async () => {
    try {
      await signInWithDiscord();
    } catch (err) {
      console.error('Discord login failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading) {
    return (
      <Button loading disabled>
        読み込み中...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Group>
        <Text size="sm" c="dimmed">
          {user.email}
        </Text>
        <Button variant="outline" onClick={handleSignOut}>
          ログアウト
        </Button>
      </Group>
    );
  }

  return (
    <div>
      {error && (
        <Alert color="red" title="エラー" mb="md">
          {error}
        </Alert>
      )}

      <Button
        onClick={handleDiscordSignIn}
        loading={isLoading}
        leftSection="🎮"
        variant="filled"
        color="indigo"
      >
        Discordでログイン
      </Button>
    </div>
  );
}
