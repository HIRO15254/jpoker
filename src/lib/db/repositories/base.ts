import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../connection';
import type {
  BaseEntity,
  BaseRepository,
  PaginationOptions,
  SortOptions,
} from './types';

export abstract class AbstractRepository<
  T extends BaseEntity,
  CreateData,
  UpdateData,
> implements BaseRepository<T, CreateData, UpdateData>
{
  protected db: any;

  constructor() {
    // 新しい接続方式を使用
    this.db = db;
  }

  // 抽象メソッド - 各リポジトリで実装必須
  abstract get table(): any;
  abstract mapToEntity(raw: any): T;
  abstract mapFromCreateData(data: CreateData): any;
  abstract mapFromUpdateData(data: UpdateData): any;

  async create(data: CreateData): Promise<T> {
    try {
      const insertData = this.mapFromCreateData(data);
      const result = await this.db
        .insert(this.table)
        .values(insertData)
        .returning();

      return this.mapToEntity(result[0]);
    } catch (error) {
      console.error('Error creating entity:', error);
      throw new Error('Failed to create entity');
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1);

      return result.length > 0 ? this.mapToEntity(result[0]) : null;
    } catch (error) {
      console.error('Error finding entity by ID:', error);
      return null;
    }
  }

  async update(id: string, data: UpdateData): Promise<T | null> {
    try {
      const updateData = this.mapFromUpdateData(data);
      const result = await this.db
        .update(this.table)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(this.table.id, id))
        .returning();

      return result.length > 0 ? this.mapToEntity(result[0]) : null;
    } catch (error) {
      console.error('Error updating entity:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(this.table)
        .where(eq(this.table.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error deleting entity:', error);
      return false;
    }
  }

  async list(
    options: PaginationOptions & { sort?: SortOptions } = {},
  ): Promise<T[]> {
    try {
      const { limit = 50, offset = 0, sort } = options;

      let query = this.db.select().from(this.table);

      if (sort) {
        const column = this.table[sort.field];
        if (column) {
          query = query.orderBy(
            sort.direction === 'desc' ? desc(column) : asc(column),
          );
        }
      }

      const result = await query.limit(limit).offset(offset);
      return result.map((row: any) => this.mapToEntity(row));
    } catch (error) {
      console.error('Error listing entities:', error);
      return [];
    }
  }

  async withTransaction<R>(callback: () => Promise<R>): Promise<R> {
    // 簡易的なトランザクション実装（実際の実装では適切なトランザクション管理が必要）
    try {
      return await callback();
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
}
