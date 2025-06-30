import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import Home from '../page';

const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('Home page', () => {
  it('JPokerのタイトルが表示される', () => {
    renderWithMantine(<Home />);

    const title = screen.getByRole('heading', { name: 'JPoker' });
    expect(title).toBeInTheDocument();
  });

  it('アプリケーションの説明が表示される', () => {
    renderWithMantine(<Home />);

    const description = screen.getByText('オンラインポーカーアプリケーション');
    expect(description).toBeInTheDocument();
  });

  it('Mantine UI テストボタンが表示される', () => {
    renderWithMantine(<Home />);

    const testButton = screen.getByRole('button', {
      name: 'Mantine UI テスト',
    });
    expect(testButton).toBeInTheDocument();
  });

  it('ゲーム開始ボタンが表示される', () => {
    renderWithMantine(<Home />);

    const gameButton = screen.getByRole('button', { name: 'ゲーム開始' });
    expect(gameButton).toBeInTheDocument();
  });

  it('完了メッセージが表示される', () => {
    renderWithMantine(<Home />);

    const message = screen.getByText('Mantine UI導入が完了しました');
    expect(message).toBeInTheDocument();
  });
});
