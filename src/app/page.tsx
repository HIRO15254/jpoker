import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import React, { Suspense } from 'react';
import { AuthButton } from '@/app/_components/AuthButton';
import { NotificationButton } from '@/app/_components/NotificationButton';
import { UserData } from '@/app/_components/UserData';

export default function Home() {
  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl">
        <Title order={1} ta="center">
          JPoker
        </Title>

        <Text size="lg" ta="center" c="dimmed">
          オンラインポーカーアプリケーション
        </Text>

        <Suspense fallback={<Text size="sm">ユーザー情報を読み込み中...</Text>}>
          <UserData />
        </Suspense>

        <Group>
          <NotificationButton />
          <AuthButton />
          <Button variant="outline">ゲーム開始</Button>
        </Group>

        <Text size="sm" ta="center" c="dimmed">
          Mantine UI導入が完了しました
        </Text>
      </Stack>
    </Container>
  );
}
