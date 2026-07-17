import Chip from '@mui/material/Chip';

type PurchaseAccountingStatusChipProps = {
  isAccountingPosted: boolean;
  accountingPostingStatus: string;
};

function getColor(status: string, isAccountingPosted: boolean): 'default' | 'error' | 'info' | 'success' {
  if (status.includes('عكس')) {
    return 'error';
  }

  if (status.includes('سجل سابق')) {
    return 'info';
  }

  if (isAccountingPosted || status.includes('مرحل')) {
    return 'success';
  }

  return 'default';
}

export default function PurchaseAccountingStatusChip({ isAccountingPosted, accountingPostingStatus }: PurchaseAccountingStatusChipProps) {
  return (
    <Chip
      size="small"
      variant={isAccountingPosted ? 'filled' : 'outlined'}
      color={getColor(accountingPostingStatus, isAccountingPosted)}
      label={accountingPostingStatus}
    />
  );
}
