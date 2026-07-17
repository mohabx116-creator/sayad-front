import Chip from '@mui/material/Chip';

interface Props {
  isAccountingPosted: boolean;
  accountingPostingStatus?: string | null;
}

export default function ExpenseAccountingStatusChip({ isAccountingPosted, accountingPostingStatus }: Props) {
  const label = accountingPostingStatus?.trim() || (isAccountingPosted ? 'مرحّل محاسبيًا' : 'غير مرحّل محاسبيًا');
  const normalized = label.toLowerCase();
  const color = !isAccountingPosted ? 'warning' : normalized.includes('عكس') || normalized.includes('reverse') ? 'default' : 'success';

  return <Chip size="small" label={label} color={color} />;
}
