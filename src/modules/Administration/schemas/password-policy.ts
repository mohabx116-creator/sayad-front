import { z } from 'zod';

export const passwordPolicyMessage =
  'Password must be at least 10 characters and include uppercase, lowercase, number, and special character.';

export const passwordSchema = z
  .string()
  .min(10, passwordPolicyMessage)
  .regex(/[A-Z]/, passwordPolicyMessage)
  .regex(/[a-z]/, passwordPolicyMessage)
  .regex(/[0-9]/, passwordPolicyMessage)
  .regex(/[^a-zA-Z0-9]/, passwordPolicyMessage);
