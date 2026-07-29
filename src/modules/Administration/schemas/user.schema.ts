import { z } from 'zod';
import { createPasswordSchema } from './password-policy';

export type CreateUserValidationMessages = {
  displayNameRequired: string;
  displayNameTooLong: string;
  emailRequired: string;
  emailInvalid: string;
  emailTooLong: string;
  passwordConfirmationMismatch: string;
  passwordPolicy: string;
  roleRequired: string;
  inactiveRole: string;
  roleNotFound: string;
  duplicateRole: string;
};

export function buildCreateUserSchema(messages: CreateUserValidationMessages) {
  return z
    .object({
      displayName: z.string().min(1, messages.displayNameRequired).max(200, messages.displayNameTooLong),
      email: z.string().min(1, messages.emailRequired).email(messages.emailInvalid).max(320, messages.emailTooLong),
      password: createPasswordSchema(messages.passwordPolicy),
      confirmPassword: z.string(),
      roleIds: z.array(z.string())
    })
    .superRefine((value, ctx) => {
      if (value.password !== value.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: messages.passwordConfirmationMismatch
        });
      }

      const normalizedRoleIds = value.roleIds.map((roleId) => roleId.trim()).filter(Boolean);
      const uniqueRoleIds = Array.from(new Set(normalizedRoleIds));

      if (uniqueRoleIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['roleIds'],
          message: messages.roleRequired
        });
        return;
      }

      if (uniqueRoleIds.length !== normalizedRoleIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['roleIds'],
          message: messages.duplicateRole
        });
      }
    });
}

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  rowVersion: z.string().min(1)
});
