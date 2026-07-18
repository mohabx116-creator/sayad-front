import { z } from 'zod';

import type { AccountingAccountType, CashFlowActivityType } from '../types/accounting.types';
import { ACCOUNTING_ACCOUNT_TYPES, CASH_FLOW_ACTIVITY_TYPES } from '../utils/accounting.constants';

const accountTypeValues = Object.values(ACCOUNTING_ACCOUNT_TYPES) as [AccountingAccountType, ...AccountingAccountType[]];
const cashFlowActivityTypeValues = Object.values(CASH_FLOW_ACTIVITY_TYPES) as [CashFlowActivityType, ...CashFlowActivityType[]];

export const accountingAccountSchema = z.object({
  code: z.string().trim().min(1, 'Account code is required').max(50, 'Account code is too long'),
  nameArabic: z.string().trim().min(1, 'Arabic name is required').max(200, 'Arabic name is too long'),
  nameEnglish: z.string().trim().max(200, 'English name is too long').optional().or(z.literal('')),
  accountType: z.enum(accountTypeValues),
  parentId: z.string().optional().or(z.literal('')),
  isPosting: z.boolean(),
  isActive: z.boolean(),
  isSystem: z.boolean(),
  cashFlowActivityType: z.enum(cashFlowActivityTypeValues),
  description: z.string().trim().max(1000, 'Description is too long').optional().or(z.literal('')),
  rowVersion: z.string().optional()
});

export const createAccountingAccountSchema = accountingAccountSchema;
export const updateAccountingAccountSchema = accountingAccountSchema.extend({
  rowVersion: z.string().min(1, 'Row version is required')
});
