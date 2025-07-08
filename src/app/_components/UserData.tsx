import { headers } from 'next/headers';
import { UserDataPresentation } from './UserDataPresentation';

export async function UserData() {
  try {
    // Server ComponentからAPI Routeへのリクエスト時にheadersを転送
    const headersList = await headers();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 転送するヘッダーを適切にフィルタリング
    const forwardHeaders: Record<string, string> = {};

    // 必要なヘッダーのみを転送
    for (const [key, value] of headersList.entries()) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey === 'cookie' ||
        lowerKey === 'authorization' ||
        lowerKey === 'user-agent'
      ) {
        forwardHeaders[key] = value;
      }
    }

    const response = await fetch(`${baseUrl}/api/me`, {
      method: 'GET',
      headers: forwardHeaders,
    });

    if (response.status === 401) {
      return <UserDataPresentation state="unauthenticated" />;
    }

    if (response.status === 404) {
      return <UserDataPresentation state="not-found" />;
    }

    if (!response.ok) {
      console.error('API error:', response.status, response.statusText);
      return <UserDataPresentation state="error" />;
    }

    const data = await response.json();

    if (!data.user) {
      return <UserDataPresentation state="not-found" />;
    }

    return <UserDataPresentation state="success" user={data.user} />;
  } catch (error) {
    console.error('Fetch error:', error);
    return <UserDataPresentation state="error" />;
  }
}
