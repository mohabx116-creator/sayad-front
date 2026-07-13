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
import { useInventoryCategories } from '../hooks/useInventory';

export default function InventoryCategoriesPage() {
  const { items, isLoading, error } = useInventoryCategories();
  return (
    <>
      <Breadcrumbs custom heading="inventory-categories" links={[{ title: 'inventory' }, { title: 'inventory-categories' }]} />
      <MainCard title={<FormattedMessage id="inventory-categories" />}>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>}
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell><FormattedMessage id="item-code" /></TableCell><TableCell><FormattedMessage id="name" /></TableCell><TableCell><FormattedMessage id="status" /></TableCell></TableRow></TableHead>
            <TableBody>{items.map((category) => <TableRow key={category.id}><TableCell>{category.code}</TableCell><TableCell>{category.nameArabic}</TableCell><TableCell>{category.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />}</TableCell></TableRow>)}</TableBody>
          </Table>
        </TableContainer>
      </MainCard>
    </>
  );
}
