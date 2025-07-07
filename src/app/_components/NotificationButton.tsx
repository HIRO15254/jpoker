'use client';

import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React from 'react';

export function NotificationButton() {
  const showNotification = () => {
    notifications.show({
      title: 'Mantine UI',
      message: 'JPokerへようこそ！',
      color: 'blue',
    });
  };

  return (
    <Button variant="filled" onClick={showNotification}>
      Mantine UI テスト
    </Button>
  );
}
