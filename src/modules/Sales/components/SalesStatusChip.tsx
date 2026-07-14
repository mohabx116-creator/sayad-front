import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';
import type { SalesDocumentStatus } from '../types/sales.types';

const statusLabel: Record<SalesDocumentStatus, string> = {
  Draft: 'sales.status.draft',
  Posted: 'sales.status.posted',
  Cancelled: 'sales.status.cancelled'
};

export default function SalesStatusChip({ status }: { status: SalesDocumentStatus }) {
  return <Chip size="small" label={<FormattedMessage id={statusLabel[status]} />} color={status === 'Posted' ? 'success' : status === 'Cancelled' ? 'default' : 'warning'} />;
}
