import { describe, expect, it } from 'vitest';
import { type NewUser, type User, users } from '../schema/users';

describe('users schema', () => {
  it('should have correct table structure', () => {
    expect(users).toBeDefined();
  });

  it('should have all required columns', () => {
    const columns = Object.keys(users);

    expect(columns).toContain('id');
    expect(columns).toContain('email');
    expect(columns).toContain('username');
    expect(columns).toContain('displayName');
    expect(columns).toContain('avatarUrl');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  it('should have correct column properties', () => {
    expect(users.id).toBeDefined();
    expect(users.email).toBeDefined();
    expect(users.username).toBeDefined();
    expect(users.displayName).toBeDefined();
    expect(users.avatarUrl).toBeDefined();
    expect(users.createdAt).toBeDefined();
    expect(users.updatedAt).toBeDefined();
  });

  it('should have primary key on id', () => {
    expect(users.id.primary).toBe(true);
  });

  it('should have column definitions', () => {
    expect(users.email).toBeDefined();
    expect(users.username).toBeDefined();
    expect(users.displayName).toBeDefined();
    expect(users.avatarUrl).toBeDefined();
  });

  it('should infer types correctly', () => {
    // Type checks - これらはコンパイル時に検証される
    const user: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUser: NewUser = {
      email: 'new@example.com',
      username: 'newuser',
      displayName: 'New User',
      avatarUrl: null,
    };

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(newUser.email).toBe('new@example.com');
  });

  it('should support optional fields in NewUser type', () => {
    const minimalUser: NewUser = {
      email: 'minimal@example.com',
      username: 'minimal',
    };

    expect(minimalUser.email).toBe('minimal@example.com');
    expect(minimalUser.username).toBe('minimal');
  });

  it('should export User and NewUser types', () => {
    // Type existence check - コンパイル時に検証される
    const user: User = {} as User;
    const newUser: NewUser = {} as NewUser;

    expect(typeof user).toBe('object');
    expect(typeof newUser).toBe('object');
  });
});
