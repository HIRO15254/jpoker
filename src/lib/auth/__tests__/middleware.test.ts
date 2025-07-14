import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/connection';
import { createServerSideClient } from '@/lib/supabase/server';
import { requireAdmin, requireAuth } from '../middleware';

vi.mock('@/lib/supabase/server');
vi.mock('@/lib/db/connection');

const mockCreateServerSideClient = vi.mocked(createServerSideClient);
const mockDb = vi.mocked(db);

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should redirect to home if no user', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: null }, error: null }),
        },
      };
      mockCreateServerSideClient.mockResolvedValue(mockSupabase);

      const request = new NextRequest('http://localhost:3000/admin');
      const result = await requireAuth(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).headers.get('location')).toBe(
        'http://localhost:3000/',
      );
    });

    it('should redirect to home if auth error', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Auth error'),
          }),
        },
      };
      mockCreateServerSideClient.mockResolvedValue(mockSupabase);

      const request = new NextRequest('http://localhost:3000/admin');
      const result = await requireAuth(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).headers.get('location')).toBe(
        'http://localhost:3000/',
      );
    });

    it('should return user if authenticated', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      };
      mockCreateServerSideClient.mockResolvedValue(mockSupabase);

      const request = new NextRequest('http://localhost:3000/admin');
      const result = await requireAuth(request);

      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('requireAdmin', () => {
    it('should redirect if not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: null }, error: null }),
        },
      };
      mockCreateServerSideClient.mockResolvedValue(mockSupabase);

      const request = new NextRequest('http://localhost:3000/admin');
      const result = await requireAdmin(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).headers.get('location')).toBe(
        'http://localhost:3000/',
      );
    });

    it('should redirect if user is not admin', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      };
      mockCreateServerSideClient.mockResolvedValue(mockSupabase);

      const mockDbUser = { id: '1', email: 'test@example.com', isAdmin: false };
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockDbUser]),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/admin');
      const result = await requireAdmin(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).headers.get('location')).toBe(
        'http://localhost:3000/',
      );
    });

    it('should return user and dbUser if admin', async () => {
      const mockUser = { id: '1', email: 'admin@example.com' };
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      };
      mockCreateServerSideClient.mockResolvedValue(mockSupabase);

      const mockDbUser = { id: '1', email: 'admin@example.com', isAdmin: true };
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockDbUser]),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/admin');
      const result = await requireAdmin(request);

      expect(result).toEqual({ user: mockUser, dbUser: mockDbUser });
    });
  });
});
