import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';

export default function UserLockChip({ isLocked }: { isLocked: boolean }) {
  return <Chip size="small" color={isLocked ? 'error' : 'success'} label={<FormattedMessage id={isLocked ? 'locked' : 'unlocked'} />} />;
}
