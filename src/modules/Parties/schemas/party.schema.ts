import { z } from 'zod';

export const openingBalanceSchema = z.object({
  entryDate: z.string().min(1),
  amount: z.number().min(0.01),
  balanceNature: z.enum(['Debit', 'Credit']),
  notes: z.string().max(1000).optional().nullable()
});

export const createPartySchema = z
  .object({
    name: z.string().min(1).max(200),
    partyType: z.enum(['customer', 'supplier', 'both']),
    mobileNumber: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    isActive: z.boolean(),
    includeOpeningBalance: z.boolean(),
    openingBalanceAmount: z.number().optional().nullable(),
    openingBalanceNature: z.enum(['Debit', 'Credit', '']),
    openingBalanceDate: z.string().optional()
  })
  .superRefine((value, context) => {
    if (!value.includeOpeningBalance) return;

    if (value.openingBalanceAmount == null || value.openingBalanceAmount <= 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['openingBalanceAmount'], message: 'Opening balance amount must be greater than zero.' });
    }
    if (!value.openingBalanceNature) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['openingBalanceNature'], message: 'Opening balance direction is required.' });
    }
    if (!value.openingBalanceDate) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['openingBalanceDate'], message: 'Opening balance date is required.' });
    }
  });

export const updatePartySchema = z
  .object({
    name: z.string().min(1).max(200),
    partyType: z.enum(['customer', 'supplier', 'both']),
    mobileNumber: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    isActive: z.boolean(),
    rowVersion: z.string().min(1)
  });

export const correctOpeningBalanceSchema = z.object({
  entryDate: z.string().min(1),
  amount: z.number().min(0.01),
  balanceNature: z.enum(['Debit', 'Credit', '']),
  reason: z.string().min(1).max(500),
  expectedOpeningBalanceEntryId: z.string().min(1)
}).refine((value) => Boolean(value.balanceNature), {
  path: ['balanceNature'],
  message: 'Opening balance direction is required.'
});
