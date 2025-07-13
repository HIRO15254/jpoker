import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import React, { type ReactNode } from 'react';

interface MantineTestProviderProps {
  children: ReactNode;
}

export function MantineTestProvider({ children }: MantineTestProviderProps) {
  return (
    <MantineProvider>
      <NotificationsProvider>
        <ModalsProvider>
          {children}
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
}