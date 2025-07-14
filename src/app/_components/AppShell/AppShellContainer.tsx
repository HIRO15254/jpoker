import 'server-only';
import type { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { AppShellPresentation } from './AppShellPresentation';

interface AppShellContainerProps {
  children: ReactNode;
}

export async function AppShellContainer({ children }: AppShellContainerProps) {
  const user = await getCurrentUser();

  return <AppShellPresentation user={user}>{children}</AppShellPresentation>;
}
