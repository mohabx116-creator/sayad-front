export function getTreasurySourceDocumentLabel(sourceDocumentType?: string | null) {
  switch ((sourceDocumentType ?? '').toLowerCase()) {
    case 'salesinvoice':
      return 'فاتورة بيع';
    case 'purchaseinvoice':
      return 'فاتورة شراء';
    case 'expense':
      return 'مصروف';
    default:
      return sourceDocumentType ?? '-';
  }
}

export function getTreasurySettlementStatusLabel(allocatedAmount: number, outstandingAmount: number) {
  if (allocatedAmount <= 0) {
    return 'غير مسدد';
  }

  if (allocatedAmount >= outstandingAmount) {
    return 'تم السداد بالكامل';
  }

  return 'سداد جزئي';
}

export function getTreasuryPaymentMethodLabel(paymentMethod?: string | null) {
  switch ((paymentMethod ?? '').toLowerCase()) {
    case 'cash':
      return 'نقدي';
    case 'banktransfer':
      return 'تحويل بنكي';
    case 'card':
      return 'بطاقة';
    case 'cheque':
      return 'شيك';
    case 'electronicwallet':
      return 'محفظة إلكترونية';
    case 'other':
      return 'أخرى';
    default:
      return paymentMethod ?? '-';
  }
}
