import Chip from '@mui/material/Chip';
import { useIntl } from 'react-intl';

export default function BomStatusChip({ isActive }: { isActive: boolean }) {
  const intl = useIntl();
  return (
    <Chip
      size="small"
      label={
        isActive
          ? intl.formatMessage({ id: 'active', defaultMessage: 'Active' })
          : intl.formatMessage({ id: 'inactive', defaultMessage: 'Inactive' })
      }
      color={isActive ? 'success' : 'default'}
      variant="outlined"
    />
  );
}
