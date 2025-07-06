import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'JPoker',
  description: 'オンラインポーカーアプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MantineProvider>
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
