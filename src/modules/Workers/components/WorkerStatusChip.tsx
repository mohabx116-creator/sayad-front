import { FormattedMessage } from 'react-intl';

import Chip from '@mui/material/Chip';

type WorkerStatusChipProps = {
  isActive: boolean;
};

export default function WorkerStatusChip({ isActive }: WorkerStatusChipProps) {
  return (
    <Chip
      size="small"
      variant="outlined"
      color={isActive ? 'success' : 'default'}
      label={<FormattedMessage id={isActive ? 'active' : 'inactive'} />}
      sx={{
        borderRadius: 999,
        fontWeight: 700,
        px: 0.5,
        bgcolor: isActive ? 'success.lighter' : 'grey.100'
      }}
    />
  );
}
