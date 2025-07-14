import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineTestProvider } from '@/test/MantineTestProvider';
import { AppShellPresentation } from './AppShellPresentation';

interface MockUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

describe('AppShellPresentation', () => {
  const mockUser: MockUser = {
    id: '1',
    name: 'テストユーザー',
    email: 'test@example.com',
    isAdmin: false,
  };

  const mockAdminUser: MockUser = {
    id: '2',
    name: '管理者',
    email: 'admin@example.com',
    isAdmin: true,
  };

  const defaultProps = {
    user: mockUser,
    children: <div>メインコンテンツ</div>,
    onNavigate: vi.fn(),
    onToggleMobile: vi.fn(),
    mobileOpened: false,
  };

  describe('基本表示テスト', () => {
    it('AppShellの基本構造が表示される', () => {
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} />
        </MantineTestProvider>
      );

      // ヘッダーが表示される
      expect(screen.getByRole('banner')).toBeInTheDocument();
      
      // ナビゲーションが表示される
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // メインコンテンツが表示される
      expect(screen.getByText('メインコンテンツ')).toBeInTheDocument();
    });

    it('ヘッダーにユーザー情報が表示される', () => {
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} />
        </MantineTestProvider>
      );

      // ユーザー名が表示される
      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });

    it('サイドバーに基本ナビゲーションリンクが表示される', () => {
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} />
        </MantineTestProvider>
      );

      // 基本ナビゲーションリンクを確認
      expect(screen.getByText('ホーム')).toBeInTheDocument();
      expect(screen.getByText('プロフィール')).toBeInTheDocument();
    });
  });

  describe('ナビゲーションテスト', () => {
    it('ナビゲーションリンクをクリックすると適切なコールバックが呼ばれる', () => {
      const onNavigate = vi.fn();
      
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} onNavigate={onNavigate} />
        </MantineTestProvider>
      );

      // ホームリンクをクリック
      fireEvent.click(screen.getByText('ホーム'));
      expect(onNavigate).toHaveBeenCalledWith('/');

      // プロフィールリンクをクリック
      fireEvent.click(screen.getByText('プロフィール'));
      expect(onNavigate).toHaveBeenCalledWith('/profile');
    });

    it('現在のページがアクティブ状態で表示される', () => {
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} currentPath="/" />
        </MantineTestProvider>
      );

      // アクティブなリンクにはaria-current属性が付与される
      const homeLink = screen.getByText('ホーム').closest('a');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('認証状態テスト', () => {
    it('未認証時は認証が必要なメニューが表示されない', () => {
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} user={null} />
        </MantineTestProvider>
      );

      // プロフィールメニューが表示されない
      expect(screen.queryByText('プロフィール')).not.toBeInTheDocument();
      
      // ログインリンクが表示される
      expect(screen.getByText('ログイン')).toBeInTheDocument();
    });

    it('一般ユーザーには管理メニューが表示されない', () => {
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} user={mockUser} />
        </MantineTestProvider>
      );

      // 管理メニューが表示されない
      expect(screen.queryByText('管理画面')).not.toBeInTheDocument();
    });

    it('管理者ユーザーには管理メニューが表示される', () => {
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} user={mockAdminUser} />
        </MantineTestProvider>
      );

      // 管理メニューが表示される
      expect(screen.getByText('管理画面')).toBeInTheDocument();
    });
  });

  describe('インタラクションテスト', () => {
    it('ハンバーガーメニューボタンをクリックするとコールバックが呼ばれる', () => {
      const onToggleMobile = vi.fn();
      
      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} onToggleMobile={onToggleMobile} />
        </MantineTestProvider>
      );

      // ハンバーガーメニューボタンを探してクリック
      const burgerButton = screen.getByRole('button', { name: /toggle navigation/i });
      fireEvent.click(burgerButton);
      
      expect(onToggleMobile).toHaveBeenCalledTimes(1);
    });

    it('モバイル表示状態に応じてサイドバーの表示が変わる', () => {
      const { rerender } = render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} mobileOpened={false} />
        </MantineTestProvider>
      );

      // モバイルで閉じている状態
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveAttribute('data-hidden', 'true');

      // モバイルで開いている状態に更新
      rerender(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} mobileOpened={true} />
        </MantineTestProvider>
      );

      expect(navbar).toHaveAttribute('data-hidden', 'false');
    });
  });

  describe('エッジケーステスト', () => {
    it('長いユーザー名が適切に表示される', () => {
      const longNameUser = {
        ...mockUser,
        name: 'とても長いユーザー名でテストを行うためのユーザー',
      };

      render(
        <MantineTestProvider>
          <AppShellPresentation {...defaultProps} user={longNameUser} />
        </MantineTestProvider>
      );

      // 長いユーザー名が表示される（切り取られる可能性も考慮）
      expect(screen.getByText(/とても長いユーザー名/)).toBeInTheDocument();
    });

    it('ユーザー情報がnullの場合でもクラッシュしない', () => {
      expect(() => {
        render(
          <MantineTestProvider>
            <AppShellPresentation {...defaultProps} user={null} />
          </MantineTestProvider>
        );
      }).not.toThrow();
    });

    it('onNavigateコールバックがnullでもクラッシュしない', () => {
      expect(() => {
        render(
          <MantineTestProvider>
            <AppShellPresentation {...defaultProps} onNavigate={undefined} />
          </MantineTestProvider>
        );
      }).not.toThrow();
    });
  });
});