import { z } from 'zod';
import { passwordSchema } from './password-policy';

export const createUserSchema = z
  .object({
    displayName: z.string().min(1).max(200),
    email: z.string().email().max(320),
    password: passwordSchema,
    confirmPassword: z.string(),
    roleIds: z.array(z.string())
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password confirmation does not match.'
  });

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  rowVersion: z.string().min(1)
});
