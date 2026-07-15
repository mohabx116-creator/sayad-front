import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';

export default function ExpenseCategoryStatusChip({ isActive }: { isActive: boolean }) {
  return (
    <Chip
      size="small"
      label={isActive ? <FormattedMessage id="active" defaultMessage="نشط" /> : <FormattedMessage id="inactive" defaultMessage="غير نشط" />}
      color={isActive ? 'success' : 'default'}
    />
  );
}
