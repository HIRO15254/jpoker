import { createInsertSchema } from 'drizzle-zod';
import { currencies } from '@/lib/db/schema';

export const editCurrencySchema = createInsertSchema(currencies, {
  name: (schema) => schema.min(2).max(100).optional(),
  symbol: (schema) =>
    schema
      .min(1)
      .max(10)
      .regex(/^[A-Z]+$/)
      .optional(),
  isActive: (schema) => schema.optional(),
})
  .pick({
    name: true,
    symbol: true,
    isActive: true,
  })
  .partial();
