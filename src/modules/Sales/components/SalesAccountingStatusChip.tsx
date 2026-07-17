import Chip from '@mui/material/Chip';

type Props = {
  isAccountingPosted?: boolean;
  accountingPostingStatus?: string;
};

export default function SalesAccountingStatusChip({ isAccountingPosted, accountingPostingStatus }: Props) {
  const label = accountingPostingStatus || 'غير مرحل محاسبيًا';

  return (
    <Chip
      size="small"
      variant="outlined"
      label={label}
      color={isAccountingPosted ? 'success' : 'default'}
    />
  );
}
