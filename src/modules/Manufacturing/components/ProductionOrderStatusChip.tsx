import Chip from '@mui/material/Chip';
import { useIntl } from 'react-intl';
import type { ProductionStatus } from '../types/manufacturing.types';

interface Props {
  status: ProductionStatus;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<
  ProductionStatus,
  { labelKey: string; defaultMessage: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }
> = {
  Draft: { labelKey: 'production-order-status.Draft', defaultMessage: 'Draft', color: 'default' },
  Approved: { labelKey: 'production-order-status.Approved', defaultMessage: 'Approved', color: 'info' },
  Released: { labelKey: 'production-order-status.Released', defaultMessage: 'Released', color: 'primary' },
  InProgress: { labelKey: 'production-order-status.InProgress', defaultMessage: 'In Progress', color: 'warning' },
  Completed: { labelKey: 'production-order-status.Completed', defaultMessage: 'Completed', color: 'secondary' },
  Closed: { labelKey: 'production-order-status.Closed', defaultMessage: 'Closed', color: 'success' },
  Cancelled: { labelKey: 'production-order-status.Cancelled', defaultMessage: 'Cancelled', color: 'error' }
};

export default function ProductionOrderStatusChip({ status, size = 'small' }: Props) {
  const intl = useIntl();
  const config = STATUS_CONFIG[status] ?? { labelKey: `production-order-status.${status}`, defaultMessage: status, color: 'default' as const };
  return <Chip size={size} label={intl.formatMessage({ id: config.labelKey, defaultMessage: config.defaultMessage })} color={config.color} />;
}
