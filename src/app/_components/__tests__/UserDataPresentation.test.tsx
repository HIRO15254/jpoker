import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import type { User } from '@/lib/db/schema/users';
import { UserDataPresentation } from '../UserDataPresentation';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('UserDataPresentation', () => {
  it('認証済みユーザーの情報を正常に表示する', () => {
    // Arrange
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    // Act
    render(
      <TestWrapper>
        <UserDataPresentation state="success" user={mockUser} />
      </TestWrapper>,
    );

    // Assert
    expect(document.body.textContent).toContain('Test User');
    expect(document.body.textContent).toContain('@testuser');
    expect(document.body.textContent).toContain('test@example.com');
    expect(document.body.textContent).toContain('オンライン');
  });

  it('displayNameがない場合はusernameを表示する', () => {
    // Arrange
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      displayName: null,
      avatarUrl: null,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    // Act
    render(
      <TestWrapper>
        <UserDataPresentation state="success" user={mockUser} />
      </TestWrapper>,
    );

    // Assert
    expect(document.body.textContent).toContain('testuser');
    expect(document.body.textContent).toContain('@testuser');
    expect(document.body.textContent).toContain('test@example.com');
  });

  it('未認証の場合はログイン促進メッセージを表示する', () => {
    // Act
    render(
      <TestWrapper>
        <UserDataPresentation state="unauthenticated" />
      </TestWrapper>,
    );

    // Assert
    expect(document.body.textContent).toContain(
      'ログインしてユーザー情報を表示',
    );
  });

  it('エラーの場合はエラーメッセージを表示する', () => {
    // Act
    render(
      <TestWrapper>
        <UserDataPresentation state="error" />
      </TestWrapper>,
    );

    // Assert
    expect(document.body.textContent).toContain(
      'ユーザー情報の取得に失敗しました',
    );
  });

  it('ユーザーが見つからない場合は適切なメッセージを表示する', () => {
    // Act
    render(
      <TestWrapper>
        <UserDataPresentation state="not-found" />
      </TestWrapper>,
    );

    // Assert
    expect(document.body.textContent).toContain('ユーザー情報が見つかりません');
  });
});
