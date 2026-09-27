import { z } from 'zod';

const decimal4Pattern = /^(?:\d+|\d+\.\d{1,4})$/;
const decimal2Pattern = /^(?:\d+|\d+\.\d{1,2})$/;

type MovementValidationValues = {
  movementType: string;
  quantity: string;
  amount: string;
  overtimeCalculationType: string;
  overtimeRate: string;
  nightWorkMultiplier: string;
};

const baseSchema = {
  workerId: z.string().min(1, 'Worker is required'),
  movementDate: z.string().min(1, 'Movement date is required'),
  movementType: z.string().refine((value) => ['1', '2', '3', '4', '5'].includes(value), {
    message: 'Movement type is required'
  }),
  quantity: z.string().refine((value) => value === '' || decimal4Pattern.test(value), {
    message: 'Quantity must be greater than zero.'
  }),
  amount: z.string().refine((value) => value === '' || decimal2Pattern.test(value), {
    message: 'Amount must be greater than zero.'
  }),
  overtimeCalculationType: z.string(),
  overtimeRate: z.string().refine((value) => value === '' || decimal4Pattern.test(value), {
    message: 'Rate must be greater than zero.'
  }),
  nightWorkMultiplier: z.string().refine((value) => value === '' || decimal4Pattern.test(value), {
    message: 'Multiplier must be greater than zero.'
  }),
  reason: z.string().min(1, 'Reason is required').max(1000),
  notes: z.string().max(1000)
};

function withConditionalValidation<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.superRefine((values, ctx) => {
    const movementValues = values as typeof values & MovementValidationValues;

    if (['1', '2', '3'].includes(movementValues.movementType)) {
      if (movementValues.quantity.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['quantity'],
          message: 'Quantity is required.'
        });
      } else if (Number(movementValues.quantity) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['quantity'],
          message: 'Quantity must be greater than zero.'
        });
      }

      if (movementValues.amount.trim() !== '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amount'],
          message: 'Amount is not used for this movement type.'
        });
      }
    }

    if (['4', '5'].includes(movementValues.movementType)) {
      if (movementValues.amount.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amount'],
          message: 'Amount is required.'
        });
      } else if (Number(movementValues.amount) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amount'],
          message: 'Amount must be greater than zero.'
        });
      }

      if (movementValues.quantity.trim() !== '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['quantity'],
          message: 'Quantity is not used for this movement type.'
        });
      }
    }

    if (movementValues.movementType !== '2' && (movementValues.overtimeCalculationType !== '' || movementValues.overtimeRate.trim() !== '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['overtimeCalculationType'], message: 'Overtime settings are only used for overtime.' });
    }

    if (movementValues.movementType === '2' && movementValues.overtimeCalculationType !== '' && !['0', '1', '2'].includes(movementValues.overtimeCalculationType)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['overtimeCalculationType'], message: 'Select a valid overtime method.' });
    }

    if (movementValues.movementType === '2' && ['1', '2'].includes(movementValues.overtimeCalculationType) && movementValues.overtimeRate.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['overtimeRate'], message: 'Rate is required for the selected overtime method.' });
    }

    if (movementValues.movementType !== '3' && movementValues.nightWorkMultiplier.trim() !== '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nightWorkMultiplier'], message: 'Night multiplier is only used for night work.' });
    }
  });
}

export const createMonthlyMovementSchema = withConditionalValidation(z.object({
  ...baseSchema
}));

export const updateMonthlyMovementSchema = withConditionalValidation(z.object({
  ...baseSchema,
  rowVersion: z.string().min(1, 'RowVersion is required')
}));
