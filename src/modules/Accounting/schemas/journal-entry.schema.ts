import { z } from 'zod';

const moneyString = z
  .string()
  .trim()
  .refine((value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0), 'Amount must be a non-negative number');

const journalEntryLineSchema = z
  .object({
    accountId: z.string().trim().min(1, 'Account is required'),
    debitAmount: moneyString,
    creditAmount: moneyString,
    descriptionArabic: z.string().trim().max(500, 'Arabic description is too long').optional().or(z.literal('')),
    descriptionEnglish: z.string().trim().max(500, 'English description is too long').optional().or(z.literal(''))
  })
  .superRefine((line, ctx) => {
    const debit = Number(line.debitAmount || 0);
    const credit = Number(line.creditAmount || 0);

    if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Each line must contain either a debit amount or a credit amount',
        path: ['debitAmount']
      });
    }
  });

export const journalEntryFormSchema = z
  .object({
    entryDate: z.string().trim().min(1, 'Entry date is required'),
    descriptionArabic: z.string().trim().max(500, 'Arabic description is too long').optional().or(z.literal('')),
    descriptionEnglish: z.string().trim().max(500, 'English description is too long').optional().or(z.literal('')),
    lines: z.array(journalEntryLineSchema).min(2, 'A journal entry must contain at least two lines'),
    rowVersion: z.string().optional()
  })
  .superRefine((entry, ctx) => {
    const debitTotal = entry.lines.reduce((sum, line) => sum + Number(line.debitAmount || 0), 0);
    const creditTotal = entry.lines.reduce((sum, line) => sum + Number(line.creditAmount || 0), 0);

    if (debitTotal !== creditTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Journal entry lines must be balanced',
        path: ['lines']
      });
    }
  });

export type JournalEntryFormSchema = z.infer<typeof journalEntryFormSchema>;
