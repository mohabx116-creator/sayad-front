import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FormattedMessage } from 'react-intl';

type PartyClassificationChipsProps = {
  isCustomer: boolean;
  isSupplier: boolean;
};

const customerSx = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 1.5,
  py: 0.5,
  borderRadius: 1,
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: '#d1e4ff',
  color: '#00497d',
  border: '1px solid #9ecaff',
  whiteSpace: 'nowrap'
};

const supplierSx = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 1.5,
  py: 0.5,
  borderRadius: 1,
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: '#ffdcc2',
  color: '#6d3900',
  border: '1px solid #ffb77b',
  whiteSpace: 'nowrap'
};

export default function PartyClassificationChips({ isCustomer, isSupplier }: PartyClassificationChipsProps) {
  return (
    <Stack direction="row" spacing={1}>
      {isCustomer && (
        <Box sx={customerSx}>
          <FormattedMessage id="party-customer" />
        </Box>
      )}
      {isSupplier && (
        <Box sx={supplierSx}>
          <FormattedMessage id="party-supplier" />
        </Box>
      )}
    </Stack>
  );
}
