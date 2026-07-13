import { z } from 'zod';

const classificationMessage = 'A party must be customer, supplier, or both.';

export const createPartySchema = z
  .object({
    nameArabic: z.string().min(1).max(200),
    nameEnglish: z.string().max(200).optional().nullable(),
    isCustomer: z.boolean(),
    isSupplier: z.boolean(),
    primaryPhone: z.string().max(50).optional().nullable(),
    secondaryPhone: z.string().max(50).optional().nullable(),
    email: z.string().email().max(320).optional().or(z.literal('')).nullable(),
    address: z.string().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    openingBalance: z
      .object({
        entryDate: z.string().min(1),
        amount: z.number().min(0),
        balanceNature: z.enum(['Debit', 'Credit', '']),
        notes: z.string().max(1000).optional().nullable()
      })
      .optional()
      .nullable()
  })
  .refine((value) => value.isCustomer || value.isSupplier, { path: ['isCustomer'], message: classificationMessage })
  .refine((value) => !value.openingBalance?.amount || Boolean(value.openingBalance.balanceNature), {
    path: ['openingBalance', 'balanceNature'],
    message: 'Opening balance direction is required.'
  });

export const updatePartySchema = z
  .object({
    nameArabic: z.string().min(1).max(200),
    nameEnglish: z.string().max(200).optional().nullable(),
    isCustomer: z.boolean(),
    isSupplier: z.boolean(),
    primaryPhone: z.string().max(50).optional().nullable(),
    secondaryPhone: z.string().max(50).optional().nullable(),
    email: z.string().email().max(320).optional().or(z.literal('')).nullable(),
    address: z.string().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    rowVersion: z.string().min(1)
  })
  .refine((value) => value.isCustomer || value.isSupplier, { path: ['isCustomer'], message: classificationMessage });
