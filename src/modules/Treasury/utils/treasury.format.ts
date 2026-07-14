export function formatTreasuryMoney(value: number, currencyCode?: string) {
  const formattedValue = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  return currencyCode ? `${formattedValue} ${currencyCode}` : formattedValue;
}
