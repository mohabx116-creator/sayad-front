import { z } from 'zod';
import { passwordSchema } from './password-policy';

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password confirmation does not match.'
  });
