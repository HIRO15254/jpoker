import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/lib/db/schema/users';
import { createServerSideClient } from '@/lib/supabase/server';
import { GET } from './route';

// Supabaseクライアントをモック
vi.mock('@/lib/supabase/server', () => ({
  createServerSideClient: vi.fn(),
}));

// Drizzleデータベース接続をモック
vi.mock('@/lib/db/connection', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

// 型定義
import type { SupabaseClient } from '@supabase/supabase-js';

interface MockSupabaseClient {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
}

interface MockDbQueryBuilder {
  from: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  values: ReturnType<typeof vi.fn>;
  returning: ReturnType<typeof vi.fn>;
}

// モックをインポート
const mockDb = await vi.hoisted(async () => {
  return {
    select: vi.fn(),
    insert: vi.fn(),
  };
});

describe('/api/me', () => {
  const mockQueryBuilder: MockDbQueryBuilder = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
  };

  const mockSupabaseClient: MockSupabaseClient = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(createServerSideClient).mockResolvedValue(
      mockSupabaseClient as unknown as SupabaseClient,
    );

    // Drizzleクエリビルダーのモック設定
    mockDb.select.mockReturnValue(mockQueryBuilder);
    mockDb.insert.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.from.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.limit.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.values.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.returning.mockReturnValue(mockQueryBuilder);

    // モックをセットアップ
    const { db } = await import('@/lib/db/connection');
    Object.assign(db, mockDb);
  });

  describe('GET /api/me', () => {
    it('認証済みユーザーの情報を正常に取得できる', async () => {
      // Arrange
      const mockAuthUser = {
        id: 'auth-user-id-123',
        email: 'test@example.com',
        user_metadata: {
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.png',
        },
      };

      const mockDbUser: User = {
        id: 'auth-user-id-123',
        email: 'test@example.com',
        username: 'test',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        createdAt: '2025-01-01T00:00:00.000Z' as unknown as Date,
        updatedAt: '2025-01-01T00:00:00.000Z' as unknown as Date,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      // 既存ユーザーが存在する場合
      mockQueryBuilder.limit.mockResolvedValue([mockDbUser]);

      const mockRequest = new NextRequest('http://localhost:3000/api/me');

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        user: mockDbUser,
      });
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledOnce();
      expect(mockDb.select).toHaveBeenCalledOnce();
    });

    it('未認証ユーザーの場合は401エラーを返す', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/me');

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: 'Unauthorized',
        message: 'ログインが必要です',
      });
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledOnce();
      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('認証エラーの場合は401エラーを返す', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT token' },
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/me');

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: 'Unauthorized',
        message: 'ログインが必要です',
      });
    });

    it('初回ログイン時にユーザーを自動作成する', async () => {
      // Arrange
      const mockAuthUser = {
        id: 'auth-user-id-123',
        email: 'test@example.com',
        user_metadata: {
          username: 'testuser',
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.png',
        },
      };

      const mockCreatedUser: User = {
        id: 'auth-user-id-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        createdAt: '2025-01-01T00:00:00.000Z' as unknown as Date,
        updatedAt: '2025-01-01T00:00:00.000Z' as unknown as Date,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      // ユーザーが存在しない場合（初回ログイン）
      mockQueryBuilder.limit.mockResolvedValue([]);
      mockQueryBuilder.returning.mockResolvedValue([mockCreatedUser]);

      const mockRequest = new NextRequest('http://localhost:3000/api/me');

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        user: mockCreatedUser,
      });
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledOnce();
      expect(mockDb.select).toHaveBeenCalledOnce();
      expect(mockDb.insert).toHaveBeenCalledOnce();
    });

    it('データベースエラーの場合は500エラーを返す', async () => {
      // Arrange
      const mockAuthUser = {
        id: 'auth-user-id-123',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      // データベースエラーをシミュレート
      mockQueryBuilder.limit.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const mockRequest = new NextRequest('http://localhost:3000/api/me');

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: 'Internal server error',
        message: 'サーバーエラーが発生しました',
      });
    });
  });
});
