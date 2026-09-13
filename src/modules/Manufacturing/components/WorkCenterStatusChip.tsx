import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';

export default function WorkCenterStatusChip({ isActive }: { isActive: boolean }) {
  return (
    <Chip
      size="small"
      color={isActive ? 'success' : 'default'}
      variant={isActive ? 'filled' : 'outlined'}
      label={<FormattedMessage id={isActive ? 'active' : 'inactive'} defaultMessage={isActive ? 'Active' : 'Inactive'} />}
    />
  );
}
