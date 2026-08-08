import type { PartyAdjustmentStatus, PartyAdjustmentType } from '../types/parties.types';

export type PartyAdjustmentTypeOption = {
  value: PartyAdjustmentType;
  labelId: string;
};

const PARTY_ADJUSTMENT_TYPE_LABELS: Record<PartyAdjustmentType, string> = {
  CustomerDiscount: 'party-adjustment.customer-discount',
  CustomerDebitAdjustment: 'party-adjustment.customer-debit-adjustment',
  SupplierDiscount: 'party-adjustment.supplier-discount',
  SupplierCreditAdjustment: 'party-adjustment.supplier-credit-adjustment'
};

const PARTY_ADJUSTMENT_ENTRY_LABELS: Record<string, string> = {
  PartyAdjustmentDebit: 'party-adjustment.debit',
  PartyAdjustmentCredit: 'party-adjustment.credit',
  PartyAdjustmentDebitReversal: 'party-adjustment.debit-reversal',
  PartyAdjustmentCreditReversal: 'party-adjustment.credit-reversal'
};

const PARTY_ADJUSTMENT_STATUS_LABELS: Record<PartyAdjustmentStatus, string> = {
  Posted: 'party-adjustment.status.posted',
  Reversed: 'party-adjustment.status.reversed'
};

export function getPartyAdjustmentTypeLabelId(adjustmentType: PartyAdjustmentType) {
  return PARTY_ADJUSTMENT_TYPE_LABELS[adjustmentType];
}

export function getPartyAdjustmentEntryLabelId(entryType: string) {
  return PARTY_ADJUSTMENT_ENTRY_LABELS[entryType] ?? 'party-adjustment.unknown';
}

export function getPartyAdjustmentStatusLabelId(status: PartyAdjustmentStatus) {
  return PARTY_ADJUSTMENT_STATUS_LABELS[status] ?? 'party-adjustment.status.unknown';
}

export function getAvailablePartyAdjustmentTypeOptions(isCustomer: boolean, isSupplier: boolean): PartyAdjustmentTypeOption[] {
  const options: PartyAdjustmentTypeOption[] = [];

  if (isCustomer) {
    options.push(
      { value: 'CustomerDiscount', labelId: PARTY_ADJUSTMENT_TYPE_LABELS.CustomerDiscount },
      { value: 'CustomerDebitAdjustment', labelId: PARTY_ADJUSTMENT_TYPE_LABELS.CustomerDebitAdjustment }
    );
  }

  if (isSupplier) {
    options.push(
      { value: 'SupplierDiscount', labelId: PARTY_ADJUSTMENT_TYPE_LABELS.SupplierDiscount },
      { value: 'SupplierCreditAdjustment', labelId: PARTY_ADJUSTMENT_TYPE_LABELS.SupplierCreditAdjustment }
    );
  }

  return options;
}

export function isPartyAdjustmentEntryType(entryType: string) {
  return entryType.startsWith('PartyAdjustment');
}
