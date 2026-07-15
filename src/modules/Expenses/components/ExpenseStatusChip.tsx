import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';
import type { ExpenseStatus } from '../types/expense.types';

const statusLabel: Record<string, string> = {
  Draft: 'expenses.status.draft',
  Posted: 'expenses.status.posted',
  Cancelled: 'expenses.status.cancelled'
};

export default function ExpenseStatusChip({ status }: { status: ExpenseStatus | string }) {
  return (
    <Chip
      size="small"
      label={<FormattedMessage id={statusLabel[status] || 'expenses.status.unknown'} defaultMessage={status} />}
      color={status === 'Posted' ? 'success' : status === 'Cancelled' ? 'default' : 'warning'}
    />
  );
}
