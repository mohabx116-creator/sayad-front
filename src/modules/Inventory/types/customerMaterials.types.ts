export type CustomerMaterialDocumentStatus = 'Draft' | 'Posted' | 'Cancelled';

export type CustomerMaterialIntakeLineInput = {
  itemId: string;
  unitOfMeasureId: string;
  quantity: number;
  lotBatchIdentifier: string;
  notes?: string | null;
};

export type CustomerMaterialConversionInputLineInput = {
  sourceCustomerMaterialIntakeLineId: string;
  itemId: string;
  warehouseId: string;
  unitOfMeasureId: string;
  quantity: number;
  lotBatchIdentifier: string;
  notes?: string | null;
};

export type CustomerMaterialConversionOutputLineInput = {
  sourceInputLineNumber: number;
  itemId: string;
  warehouseId: string;
  unitOfMeasureId: string;
  quantity: number;
  lotBatchIdentifier: string;
  notes?: string | null;
};

export type CustomerMaterialIntakeListItemDto = {
  id: string;
  number: string;
  intakeDate: string;
  ownerPartyId: string;
  ownerPartyCode: string;
  ownerPartyNameArabic: string;
  ownerPartyNameEnglish?: string | null;
  warehouseId: string;
  warehouseCode: string;
  warehouseNameArabic: string;
  referenceNumber?: string | null;
  status: CustomerMaterialDocumentStatus;
  totalBaseQuantity: number;
  lineCount: number;
  postedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  rowVersion: string;
  displayNumber?: string | null;
};

export type CustomerMaterialIntakeLineDto = {
  id: string;
  lineNumber: number;
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  unitOfMeasureId: string;
  unitCode: string;
  quantity: number;
  baseQuantity: number;
  lotBatchIdentifier: string;
  notes?: string | null;
  inventoryMovementId?: string | null;
};

export type CustomerMaterialIntakeDto = {
  id: string;
  number: string;
  intakeDate: string;
  ownerPartyId: string;
  ownerPartyCode: string;
  ownerPartyNameArabic: string;
  ownerPartyNameEnglish?: string | null;
  warehouseId: string;
  warehouseCode: string;
  warehouseNameArabic: string;
  referenceNumber?: string | null;
  notes?: string | null;
  status: CustomerMaterialDocumentStatus;
  postedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  cancellationReason?: string | null;
  lines: CustomerMaterialIntakeLineDto[];
  rowVersion: string;
  displayNumber?: string | null;
};

export type CustomerMaterialConversionListItemDto = {
  id: string;
  number: string;
  conversionDate: string;
  ownerPartyId: string;
  ownerPartyCode: string;
  ownerPartyNameArabic: string;
  ownerPartyNameEnglish?: string | null;
  referenceNumber?: string | null;
  status: CustomerMaterialDocumentStatus;
  totalInputBaseQuantity: number;
  totalOutputBaseQuantity: number;
  inputLineCount: number;
  outputLineCount: number;
  postedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  rowVersion: string;
  displayNumber?: string | null;
};

export type CustomerMaterialConversionInputLineDto = {
  id: string;
  lineNumber: number;
  sourceCustomerMaterialIntakeLineId: string;
  sourceCustomerMaterialIntakeNumber: string;
  sourceLotBatchIdentifier: string;
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  warehouseId: string;
  warehouseCode: string;
  warehouseNameArabic: string;
  unitOfMeasureId: string;
  unitCode: string;
  quantity: number;
  baseQuantity: number;
  lotBatchIdentifier: string;
  notes?: string | null;
  inventoryMovementId?: string | null;
};

export type CustomerMaterialConversionOutputLineDto = {
  id: string;
  lineNumber: number;
  sourceInputLineNumber: number;
  sourceCustomerMaterialConversionInputLineId?: string | null;
  sourceInputLotBatchIdentifier?: string | null;
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  warehouseId: string;
  warehouseCode: string;
  warehouseNameArabic: string;
  unitOfMeasureId: string;
  unitCode: string;
  quantity: number;
  baseQuantity: number;
  lotBatchIdentifier: string;
  notes?: string | null;
  inventoryMovementId?: string | null;
};

export type CustomerMaterialConversionDto = {
  id: string;
  number: string;
  conversionDate: string;
  ownerPartyId: string;
  ownerPartyCode: string;
  ownerPartyNameArabic: string;
  ownerPartyNameEnglish?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  status: CustomerMaterialDocumentStatus;
  postedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  cancellationReason?: string | null;
  inputLines: CustomerMaterialConversionInputLineDto[];
  outputLines: CustomerMaterialConversionOutputLineDto[];
  rowVersion: string;
  displayNumber?: string | null;
};

export type CustomerMaterialIntakeRequest = {
  ownerPartyId: string;
  warehouseId: string;
  intakeDate: string;
  referenceNumber?: string | null;
  notes?: string | null;
  lines: CustomerMaterialIntakeLineInput[];
};

export type CustomerMaterialConversionRequest = {
  ownerPartyId: string;
  conversionDate: string;
  referenceNumber?: string | null;
  notes?: string | null;
  inputLines: CustomerMaterialConversionInputLineInput[];
  outputLines: CustomerMaterialConversionOutputLineInput[];
};

export type CustomerMaterialDocumentActionRequest = {
  rowVersion: string;
};

export type CustomerMaterialDocumentCancelRequest = {
  rowVersion: string;
  reason: string;
};

