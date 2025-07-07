import { describe, expect, it, mock } from 'bun:test';
import { MantineProvider } from '@mantine/core';
import { fireEvent, render } from '@testing-library/react';
import { AuthButton } from '../AuthButton';

const mockSignInWithDiscord = mock(() => Promise.resolve());
const mockSignOut = mock(() => Promise.resolve());
const mockUseAuth = mock();

mock.module('@/lib/auth/useAuth', () => ({
  useAuth: mockUseAuth,
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('AuthButton', () => {
  it('未認証時にDiscordログインボタンが表示される', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      signInWithDiscord: mockSignInWithDiscord,
      signOut: mockSignOut,
    });

    const screen = renderWithProvider(<AuthButton />);

    expect(screen.getByText('Discordでログイン')).toBeInTheDocument();
  });

  it('認証済み時にユーザー情報とログアウトボタンが表示される', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      signInWithDiscord: mockSignInWithDiscord,
      signOut: mockSignOut,
    });

    const screen = renderWithProvider(<AuthButton />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('ローディング中に適切な表示がされる', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,
      signInWithDiscord: mockSignInWithDiscord,
      signOut: mockSignOut,
    });

    const screen = renderWithProvider(<AuthButton />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('Discordログインボタンクリック時にsignInWithDiscord関数が呼ばれる', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      signInWithDiscord: mockSignInWithDiscord,
      signOut: mockSignOut,
    });

    const screen = renderWithProvider(<AuthButton />);

    const loginButton = screen.getByText('Discordでログイン');
    fireEvent.click(loginButton);

    expect(mockSignInWithDiscord).toHaveBeenCalled();
  });

  it('ログアウトボタンクリック時にsignOut関数が呼ばれる', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      signInWithDiscord: mockSignInWithDiscord,
      signOut: mockSignOut,
    });

    const screen = renderWithProvider(<AuthButton />);

    const logoutButton = screen.getByText('ログアウト');
    fireEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('エラーメッセージが適切に表示される', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: 'Discordログインに失敗しました',
      signInWithDiscord: mockSignInWithDiscord,
      signOut: mockSignOut,
    });

    const screen = renderWithProvider(<AuthButton />);

    expect(
      screen.getByText('Discordログインに失敗しました'),
    ).toBeInTheDocument();
  });
});
