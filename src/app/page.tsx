import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import { NotificationButton } from '@/app/_components/NotificationButton';

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

        <Group>
          <NotificationButton />
          <Button variant="outline">
            ゲーム開始
          </Button>
        </Group>

        <Text size="sm" ta="center" c="dimmed">
          Mantine UI導入が完了しました
        </Text>
      </Stack>
    </Container>
  );
}
