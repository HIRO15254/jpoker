import { eq } from 'drizzle-orm';
import { users } from '../schema';
import { AbstractRepository } from './base';
import type { CreateUserData, UpdateUserData, User } from './types';

export class UserRepository extends AbstractRepository<
  User,
  CreateUserData,
  UpdateUserData
> {
  get table() {
    return users;
  }

  mapToEntity(raw: any): User {
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  mapFromCreateData(data: CreateUserData): any {
    return {
      username: data.username,
      email: data.email,
      isActive: true,
    };
  }

  mapFromUpdateData(data: UpdateUserData): any {
    const mapped: any = {};
    if (data.username !== undefined) mapped.username = data.username;
    if (data.email !== undefined) mapped.email = data.email;
    if (data.isActive !== undefined) mapped.isActive = data.isActive;
    return mapped;
  }

  // User固有のメソッド
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.email, email))
        .limit(1);

      return result.length > 0 ? this.mapToEntity(result[0]) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.username, username))
        .limit(1);

      return result.length > 0 ? this.mapToEntity(result[0]) : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      return null;
    }
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }
}
