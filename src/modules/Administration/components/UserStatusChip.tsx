import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';

export default function UserStatusChip({ isActive }: { isActive: boolean }) {
  return <Chip size="small" color={isActive ? 'success' : 'default'} label={<FormattedMessage id={isActive ? 'active' : 'inactive'} />} />;
}
