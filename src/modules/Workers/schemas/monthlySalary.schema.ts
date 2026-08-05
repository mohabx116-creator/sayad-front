import { z } from 'zod';

const decimalPattern = /^(?:\d+|\d+\.\d{1,2})$/;

export const monthlySalarySchema = z.object({
  year: z.string().min(1, 'Year is required').refine((value) => /^\d+$/.test(value) && Number(value) >= 2000 && Number(value) <= 3000, {
    message: 'Year must be between 2000 and 3000.'
  }),
  month: z.string().min(1, 'Month is required').refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 12, {
    message: 'Month must be between 1 and 12.'
  }),
  calculatedDays: z.string().min(1, 'Calculated days are required').refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 31, {
    message: 'Calculated days must be between 1 and 31.'
  }),
  absenceDays: z.string().refine((value) => value === '' || decimalPattern.test(value), {
    message: 'Absence days must be zero or greater.'
  }),
  normalOvertimeAmount: z.string().refine((value) => value === '' || decimalPattern.test(value), {
    message: 'Normal overtime must be zero or greater.'
  }),
  nightOvertimeAmount: z.string().refine((value) => value === '' || decimalPattern.test(value), {
    message: 'Night overtime must be zero or greater.'
  }),
  bonusAmount: z.string().refine((value) => value === '' || decimalPattern.test(value), {
    message: 'Bonus amount must be zero or greater.'
  }),
  notes: z.string().max(1000),
  deductions: z.array(z.object({
    amount: z.string().refine((value) => value === '' || decimalPattern.test(value), {
      message: 'Deduction amount must be zero or greater.'
    }),
    reason: z.string().max(1000),
    source: z.enum(['Manager', 'Accountant'])
  }))
}).superRefine((values, ctx) => {
  if (Number(values.absenceDays || 0) > Number(values.calculatedDays || 26)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['absenceDays'],
      message: 'Absence days cannot exceed calculated days.'
    });
  }

  values.deductions.forEach((row, index) => {
    if (row.amount.trim() !== '' && row.reason.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deductions', index, 'reason'],
        message: 'Deduction reason is required.'
      });
    }

    if (row.amount.trim() === '' && row.reason.trim() !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deductions', index, 'amount'],
        message: 'Deduction amount is required.'
      });
    }
  });
});
