import { z } from 'zod';

export const grantCurrencySchema = z.object({
  userId: z.uuid(),
  currencyId: z.uuid(),
  amount: z.number().min(1).max(1000000),
  description: z.string().max(255).optional(),
});
