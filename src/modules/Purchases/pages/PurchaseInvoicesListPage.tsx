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
import { usePurchaseInvoices } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';

export default function PurchaseInvoicesListPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, isLoading, error } = usePurchaseInvoices({ page: page + 1, pageSize, search, status, sortBy: 'invoiceDate', sortDirection: 'desc' });

  return (
    <>
      <Breadcrumbs custom heading="purchase-invoices" links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices' }]} />
      <MainCard
        title={<FormattedMessage id="purchase-invoices" />}
        secondary={
          <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesCreate}>
            <Button component={Link} to="/purchases/invoices/new" variant="contained" startIcon={<IconPlus size={18} />}>
              <FormattedMessage id="create-purchase-invoice" />
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
                    <TableCell><FormattedMessage id="invoice-number" /></TableCell>
                    <TableCell><FormattedMessage id="supplier" /></TableCell>
                    <TableCell><FormattedMessage id="invoice-date" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell><FormattedMessage id="grand-total" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((invoice) => (
                    <TableRow hover key={invoice.id}>
                      <TableCell>{invoice.number}</TableCell>
                      <TableCell>{invoice.supplierCode} - {invoice.supplierNameArabic}</TableCell>
                      <TableCell>{invoice.invoiceDate}</TableCell>
                      <TableCell><PurchaseStatusChip status={invoice.status} /></TableCell>
                      <TableCell>{invoice.grandTotal.toFixed(2)} {invoice.currencyCode}</TableCell>
                      <TableCell align="right">
                        <Tooltip title={<FormattedMessage id="details" />}>
                          <IconButton component={Link} to={`/purchases/invoices/${invoice.id}`}><IconEye size={18} /></IconButton>
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
