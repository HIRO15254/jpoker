import { Avatar, Badge, Card, Group, Stack, Text } from '@mantine/core';
import React from 'react';
import type { User } from '@/lib/db/schema/users';

type UserDataPresentationProps =
  | {
      state: 'success';
      user: User;
    }
  | {
      state: 'unauthenticated';
    }
  | {
      state: 'error';
    }
  | {
      state: 'not-found';
    };

export function UserDataPresentation(props: UserDataPresentationProps) {
  if (props.state === 'error') {
    return (
      <Card withBorder radius="md" p="md">
        <Text size="sm" c="red" ta="center">
          ユーザー情報の取得に失敗しました
        </Text>
      </Card>
    );
  }

  if (props.state === 'not-found') {
    return (
      <Card withBorder radius="md" p="md">
        <Text size="sm" c="dimmed" ta="center">
          ユーザー情報が見つかりません
        </Text>
      </Card>
    );
  }

  if (props.state === 'unauthenticated') {
    return (
      <Card withBorder radius="md" p="md">
        <Text size="sm" c="dimmed" ta="center">
          ログインしてユーザー情報を表示
        </Text>
      </Card>
    );
  }

  // state === 'success'
  const { user } = props;

  return (
    <Card withBorder radius="md" p="md" miw={300}>
      <Group gap="md">
        <Avatar
          src={user.avatarUrl}
          alt={user.displayName || user.username}
          radius="md"
          size="lg"
        />
        <Stack gap="xs" flex={1}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text fw={500} size="sm">
                {user.displayName || user.username}
              </Text>
              <Text size="xs" c="dimmed">
                @{user.username}
              </Text>
            </Stack>
            <Badge variant="light" color="blue" size="xs">
              オンライン
            </Badge>
          </Group>
          <Text size="xs" c="dimmed">
            {user.email}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
