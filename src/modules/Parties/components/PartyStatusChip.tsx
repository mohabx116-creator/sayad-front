import Box from '@mui/material/Box';
import { FormattedMessage } from 'react-intl';

const activeSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  px: 1.25,
  py: 0.5,
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: '#e8f5e9',
  color: '#1b5e20',
  border: '1px solid #c8e6c9',
  whiteSpace: 'nowrap'
};

const inactiveSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  px: 1.25,
  py: 0.5,
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: '#fafafa',
  color: '#757575',
  border: '1px solid #eeeeee',
  whiteSpace: 'nowrap'
};

const activeDotSx = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: '#4caf50'
};

const inactiveDotSx = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: '#9e9e9e'
};

export default function PartyStatusChip({ isActive }: { isActive: boolean }) {
  return (
    <Box sx={isActive ? activeSx : inactiveSx}>
      <Box sx={isActive ? activeDotSx : inactiveDotSx} />
      <FormattedMessage id={isActive ? 'active' : 'inactive'} />
    </Box>
  );
}
