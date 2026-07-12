import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  descriptionArabic: z.string().max(500),
  descriptionEnglish: z.string().max(500),
  permissionIds: z.array(z.string())
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100),
  descriptionArabic: z.string().max(500),
  descriptionEnglish: z.string().max(500),
  rowVersion: z.string().min(1)
});
