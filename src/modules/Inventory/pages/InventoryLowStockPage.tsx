import { FormattedMessage } from 'react-intl';

import Chip from '@mui/material/Chip';
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
import { useLowStockItems } from '../hooks/useInventory';

export default function InventoryLowStockPage() {
  const { items, isLoading, error } = useLowStockItems();
  return (
    <>
      <Breadcrumbs custom heading="inventory-low-stock" links={[{ title: 'inventory' }, { title: 'inventory-low-stock' }]} />
      <MainCard title={<FormattedMessage id="inventory-low-stock" />}>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>}
        {!isLoading && items.length === 0 && <Typography><FormattedMessage id="inventory-no-low-stock" /></Typography>}
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell><FormattedMessage id="item-code" /></TableCell><TableCell><FormattedMessage id="name" /></TableCell><TableCell><FormattedMessage id="current-quantity" /></TableCell><TableCell><FormattedMessage id="minimum-quantity" /></TableCell><TableCell><FormattedMessage id="stock-status" /></TableCell></TableRow></TableHead>
            <TableBody>
              {items.map((item) => <TableRow key={item.itemId}><TableCell>{item.itemCode}</TableCell><TableCell>{item.itemNameArabic}</TableCell><TableCell>{item.currentQuantity}</TableCell><TableCell>{item.minimumQuantity}</TableCell><TableCell><Chip label={item.stockStatus} color="warning" /></TableCell></TableRow>)}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>
    </>
  );
}
