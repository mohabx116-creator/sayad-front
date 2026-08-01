import Box from '@mui/material/Box';
import { FormattedMessage } from 'react-intl';

type PartyClassificationChipsProps = {
  isCustomer: boolean;
  isSupplier: boolean;
};

const chipBaseSx = {
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
  ...chipBaseSx,
  backgroundColor: '#ffdcc2',
  color: '#6d3900',
  border: '1px solid #ffb77b'
};

export default function PartyClassificationChips({ isCustomer, isSupplier }: PartyClassificationChipsProps) {
  const labelId = isCustomer && isSupplier ? 'party-type-both' : isCustomer ? 'party-customer' : 'party-supplier';
  const chipSx = isCustomer && isSupplier ? chipBaseSx : isCustomer ? chipBaseSx : supplierSx;

  return (
    <Box sx={chipSx}>
      <FormattedMessage id={labelId} />
    </Box>
  );
}
