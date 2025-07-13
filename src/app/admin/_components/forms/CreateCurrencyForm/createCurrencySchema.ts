import { createInsertSchema } from 'drizzle-zod';
import { currencies } from '@/lib/db/schema';

export const createCurrencySchema = createInsertSchema(currencies, {
  name: (schema) => schema.min(2).max(100),
  symbol: (schema) =>
    schema
      .min(1)
      .max(10)
      .regex(/^[A-Z]+$/),
  isActive: (schema) => schema.optional().default(true),
}).pick({
  name: true,
  symbol: true,
  isActive: true,
});
