import { z } from 'zod';

const baseSchema = {
  code: z.string().max(50),
  name: z.string().min(1, 'Operational job name is required').max(200),
  description: z.string().max(1000),
  isActive: z.boolean()
};

export const createOperationalJobSchema = z.object({
  ...baseSchema,
  code: z.string().max(50)
});

export const updateOperationalJobSchema = z.object({
  ...baseSchema,
  code: z.string().min(1, 'Operational job code is required').max(50),
  rowVersion: z.string().min(1, 'RowVersion is required')
});
