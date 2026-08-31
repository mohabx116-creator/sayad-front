import { z } from 'zod';

export const createWorkerOperationSchema = z.object({
  operationDate: z.string().min(1, 'Operation date is required'),
  workerId: z.string().min(1, 'Worker is required'),
  completedQuantity: z
    .string()
    .min(1, 'Completed quantity is required')
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, 'Completed quantity must be greater than 0'),
  notes: z.string().max(1000).optional().or(z.literal('')),
  rowVersion: z.string().optional()
});
