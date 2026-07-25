import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';

type MonthlyMovementStatusChipProps = {
  status: number;
  label?: string;
};

export default function MonthlyMovementStatusChip({ status, label }: MonthlyMovementStatusChipProps) {
  const color: 'default' | 'success' | 'error' = status === 1 ? 'default' : status === 2 ? 'success' : 'error';
  const fallbackLabel = status === 1 ? 'monthly-movement-status-draft' : status === 2 ? 'monthly-movement-status-approved' : 'monthly-movement-status-rejected';

  return <Chip color={color} label={label ? label : <FormattedMessage id={fallbackLabel} />} size="small" />;
}
