import Chip from '@mui/material/Chip';

import { useIntl } from 'react-intl';

import { JOURNAL_ENTRY_STATUSES } from '../utils/journal-entry.constants';
import { formatJournalEntryStatus } from '../utils/journal-entry.format';
import type { JournalEntryStatus } from '../types/journal-entry.types';

type Props = {
  status?: JournalEntryStatus | string | null;
};

export default function JournalEntryStatusChip({ status }: Props) {
  const intl = useIntl();
  const label = formatJournalEntryStatus(status, intl.locale);

  return (
    <Chip
      size="small"
      label={label}
      color={status === JOURNAL_ENTRY_STATUSES.POSTED ? 'success' : status === JOURNAL_ENTRY_STATUSES.CANCELLED ? 'default' : 'warning'}
    />
  );
}
