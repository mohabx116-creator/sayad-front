import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { FormattedMessage } from 'react-intl';

type PartyClassificationChipsProps = {
  isCustomer: boolean;
  isSupplier: boolean;
};

export default function PartyClassificationChips({ isCustomer, isSupplier }: PartyClassificationChipsProps) {
  return (
    <Stack direction="row" spacing={1}>
      {isCustomer && <Chip size="small" color="primary" label={<FormattedMessage id="party-customer" />} />}
      {isSupplier && <Chip size="small" color="secondary" label={<FormattedMessage id="party-supplier" />} />}
    </Stack>
  );
}
