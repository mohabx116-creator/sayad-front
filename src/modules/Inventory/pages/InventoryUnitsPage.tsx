import { FormattedMessage } from 'react-intl';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useInventoryUnits } from '../hooks/useInventory';

export default function InventoryUnitsPage() {
  const { items, isLoading, error } = useInventoryUnits();
  return (
    <>
      <Breadcrumbs custom heading="inventory-units" links={[{ title: 'inventory' }, { title: 'inventory-units' }]} />
      <MainCard title={<FormattedMessage id="inventory-units" />}>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>}
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell><FormattedMessage id="item-code" /></TableCell><TableCell><FormattedMessage id="name" /></TableCell><TableCell><FormattedMessage id="decimal-places" /></TableCell></TableRow></TableHead>
            <TableBody>{items.map((unit) => <TableRow key={unit.id}><TableCell>{unit.code}</TableCell><TableCell>{unit.nameArabic}</TableCell><TableCell>{unit.decimalPlaces}</TableCell></TableRow>)}</TableBody>
          </Table>
        </TableContainer>
      </MainCard>
    </>
  );
}
