import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

type Props = {
  value: 'intakes' | 'conversions';
};

export default function CustomerMaterialsTabs({ value }: Props) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs value={value} textColor="primary" indicatorColor="primary">
        <Tab value="intakes" label={<FormattedMessage id="customer-material-intakes" defaultMessage="Customer Materials" />} component={Link} to="/inventory/customer-materials/intakes" />
        <Tab value="conversions" label={<FormattedMessage id="customer-material-conversions" defaultMessage="Conversions" />} component={Link} to="/inventory/customer-materials/conversions" />
      </Tabs>
    </Box>
  );
}
