import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconEye, IconPlus } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { usePurchaseReturns } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';

export default function PurchaseReturnsListPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, isLoading, error } = usePurchaseReturns({ page: page + 1, pageSize, search, status, sortBy: 'returnDate', sortDirection: 'desc' });

  return (
    <>
      <Breadcrumbs custom heading="purchase-returns" links={[{ title: 'purchases', to: '/purchases/returns' }, { title: 'purchase-returns' }]} />
      <MainCard
        title={<FormattedMessage id="purchase-returns" />}
        secondary={
          <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsCreate}>
            <Button component={Link} to="/purchases/returns/new" variant="contained" startIcon={<IconPlus size={18} />}>
              <FormattedMessage id="create-purchase-return" />
            </Button>
          </PermissionGuard>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="search" />} value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label={<FormattedMessage id="status" />} value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
              <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
              <MenuItem value="Draft"><FormattedMessage id="purchases.status.draft" /></MenuItem>
              <MenuItem value="Posted"><FormattedMessage id="purchases.status.posted" /></MenuItem>
              <MenuItem value="Cancelled"><FormattedMessage id="purchases.status.cancelled" /></MenuItem>
            </TextField>
          </Grid>
        </Grid>
        {isLoading && <Loader />}
        {error && <Typography color="error">{intl.formatMessage({ id: 'purchase-load-error' })}</Typography>}
        {!isLoading && items.length === 0 && <Typography>{intl.formatMessage({ id: 'purchase-empty' })}</Typography>}
        {items.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="return-number" /></TableCell>
                    <TableCell><FormattedMessage id="purchase-invoice" /></TableCell>
                    <TableCell><FormattedMessage id="return-date" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell><FormattedMessage id="grand-total" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((purchaseReturn) => (
                    <TableRow hover key={purchaseReturn.id}>
                      <TableCell>{purchaseReturn.number}</TableCell>
                      <TableCell>{purchaseReturn.purchaseInvoiceNumber}</TableCell>
                      <TableCell>{purchaseReturn.returnDate}</TableCell>
                      <TableCell><PurchaseStatusChip status={purchaseReturn.status} /></TableCell>
                      <TableCell>{purchaseReturn.grandTotal.toFixed(2)} {purchaseReturn.currencyCode}</TableCell>
                      <TableCell align="right">
                        <Tooltip title={<FormattedMessage id="details" />}>
                          <IconButton component={Link} to={`/purchases/returns/${purchaseReturn.id}`}><IconEye size={18} /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={meta.totalCount}
              page={page}
              rowsPerPage={pageSize}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => { setPageSize(parseInt(event.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </MainCard>
    </>
  );
}
