import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';
import type { PurchaseDocumentStatus } from '../types/purchases.types';

const statusLabel: Record<PurchaseDocumentStatus, string> = {
  Draft: 'purchases.status.draft',
  Posted: 'purchases.status.posted',
  Cancelled: 'purchases.status.cancelled'
};

export default function PurchaseStatusChip({ status }: { status: PurchaseDocumentStatus }) {
  return <Chip size="small" label={<FormattedMessage id={statusLabel[status]} />} color={status === 'Posted' ? 'success' : status === 'Cancelled' ? 'default' : 'warning'} />;
}
