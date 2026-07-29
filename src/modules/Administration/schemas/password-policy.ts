import { z } from 'zod';

export const passwordPolicyMessage =
  'Password must be at least 10 characters and include uppercase, lowercase, number, and special character.';

export function createPasswordSchema(message = passwordPolicyMessage) {
  return z
    .string()
    .min(10, message)
    .regex(/[A-Z]/, message)
    .regex(/[a-z]/, message)
    .regex(/[0-9]/, message)
    .regex(/[^a-zA-Z0-9]/, message);
}

export const passwordSchema = createPasswordSchema();
