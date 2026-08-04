import { z } from 'zod';

const phonePattern = /^[0-9+\-\s()]+$/;
const decimalPattern = /^(?:\d+|\d+\.\d{1,4})$/;

type WageValidationValues = {
  overtimeCalculationType: string;
  overtimeRate: string;
};

const baseSchema = {
  code: z.string().max(50),
  name: z.string().min(1, 'Worker name is required').max(200),
  mobileNumber: z.string().max(50).refine((value) => value === '' || phonePattern.test(value), {
    message: 'Mobile number format is not supported.'
  }),
  address: z.string().max(300),
  operationalJobId: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000),
  isActive: z.boolean(),
  wageEffectiveFrom: z.string().min(1, 'Effective date is required'),
  dailyWage: z.string().refine((value) => value === '' || decimalPattern.test(value), {
    message: 'Daily wage must be zero or greater.'
  }),
  monthlyDaysBasis: z.string().refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 31, {
    message: 'Monthly days basis must be between 1 and 31.'
  }),
  mealAllowanceType: z.string().optional(),
  mealAllowanceValue: z.string().optional(),
  overtimeCalculationType: z.string().refine((value) => ['0', '1', '2'].includes(value), {
    message: 'Overtime calculation type is required.'
  }),
  overtimeRate: z.string().refine((value) => value === '' || decimalPattern.test(value), {
    message: 'Overtime rate must be zero or greater.'
  }),
  wageNotes: z.string().max(1000)
};

function withConditionalWageValidation<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.superRefine((values, ctx) => {
    const wageValues = values as typeof values & WageValidationValues;

    if (wageValues.overtimeCalculationType !== '0' && wageValues.overtimeRate.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['overtimeRate'],
        message: 'Overtime rate is required.'
      });
    }
  });
}

export const createWorkerSchema = withConditionalWageValidation(z.object({
  ...baseSchema,
  code: z.string().max(50)
}));

export const updateWorkerSchema = withConditionalWageValidation(z.object({
  ...baseSchema,
  code: z.string().min(1, 'Worker code is required').max(50),
  rowVersion: z.string().min(1, 'RowVersion is required'),
  wageRowVersion: z.string().optional()
}));
