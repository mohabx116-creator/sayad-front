import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';
import { TREASURY_DOCUMENT_STATUS } from '../utils/treasury.constants';

const statusLabel: Record<string, string> = {
  [TREASURY_DOCUMENT_STATUS.DRAFT]: 'treasury.status.draft',
  [TREASURY_DOCUMENT_STATUS.POSTED]: 'treasury.status.posted',
  [TREASURY_DOCUMENT_STATUS.CANCELLED]: 'treasury.status.cancelled'
};

export default function TreasuryStatusChip({ status }: { status: string }) {
  return <Chip size="small" label={<FormattedMessage id={statusLabel[status] || 'treasury.status.unknown'} />} color={status === TREASURY_DOCUMENT_STATUS.POSTED ? 'success' : status === TREASURY_DOCUMENT_STATUS.CANCELLED ? 'default' : 'warning'} />;
}
