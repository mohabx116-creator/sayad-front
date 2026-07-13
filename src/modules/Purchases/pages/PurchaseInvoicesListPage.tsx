import { useState, useMemo } from 'react';
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
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { IconEye, IconPlus, IconRefresh } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { usePurchaseInvoices } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';
import { useParties } from 'modules/Parties/hooks/useParties';

export default function PurchaseInvoicesListPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { items: suppliers } = useParties({ page: 1, pageSize: 100, isSupplier: true, sortBy: 'nameArabic' });
  const supplierLookup = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);

  const { items, meta, isLoading, error } = usePurchaseInvoices({ 
     page: page + 1, 
     pageSize, 
     search, 
     status, 
     supplierId,
     dateFrom,
     dateTo,
     sortBy: 'invoiceDate', 
     sortDirection: 'desc' 
  });

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setSupplierId('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
           <Breadcrumbs custom heading="purchase-invoices" links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices' }]} sx={{ mb: 1 }} />
           <Typography variant="h2"><FormattedMessage id="purchase-invoices" /></Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
           <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesCreate}>
             <Button component={Link} to="/purchases/invoices/new" variant="contained" color="primary" sx={{ borderRadius: 2, boxShadow: 2 }} startIcon={<IconPlus size={18} />}>
               <FormattedMessage id="create-purchase-invoice" />
             </Button>
           </PermissionGuard>
        </Stack>
      </Box>

      <MainCard 
         content={false} 
         sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
           <Grid container spacing={2} alignItems="center">
             <Grid item xs={12} md={3}>
               <TextField size="small" fullWidth label={<FormattedMessage id="search" />} placeholder={intl.formatMessage({ id: 'search' })} value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
             </Grid>
             <Grid item xs={12} md={2}>
               <TextField size="small" select fullWidth label={<FormattedMessage id="status" />} value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
                 <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
                 <MenuItem value="Draft"><FormattedMessage id="purchases.status.draft" /></MenuItem>
                 <MenuItem value="Posted"><FormattedMessage id="purchases.status.posted" /></MenuItem>
                 <MenuItem value="Cancelled"><FormattedMessage id="purchases.status.cancelled" /></MenuItem>
               </TextField>
             </Grid>
             <Grid item xs={12} md={3}>
                <Autocomplete
                   size="small"
                   options={suppliers}
                   getOptionLabel={(option) => `${option.code} - ${option.nameArabic}`}
                   value={supplierLookup.get(supplierId) || null}
                   onChange={(_, newValue) => { setSupplierId(newValue?.id || ''); setPage(0); }}
                   renderInput={(params) => <TextField {...params} label={<FormattedMessage id="supplier" />} variant="outlined" />}
                />
             </Grid>
             <Grid item xs={6} md={1.5}>
               <TextField size="small" type="date" fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="date-from" defaultMessage="Date From" />} value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(0); }} />
             </Grid>
             <Grid item xs={6} md={1.5}>
               <TextField size="small" type="date" fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="date-to" defaultMessage="Date To" />} value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(0); }} />
             </Grid>
             <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title={<FormattedMessage id="reset-filters" defaultMessage="Reset Filters" />}>
                   <IconButton onClick={resetFilters} color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <IconRefresh size={20} />
                   </IconButton>
                </Tooltip>
             </Grid>
           </Grid>
        </Box>

        <Box sx={{ p: 0 }}>
           {isLoading && <Loader />}
           {error && <Box p={3}><Typography color="error">{intl.formatMessage({ id: 'purchase-load-error' })}</Typography></Box>}
           {!isLoading && items.length === 0 && <Box p={3}><Typography color="text.secondary" textAlign="center">{intl.formatMessage({ id: 'purchase-empty' })}</Typography></Box>}
           
           {items.length > 0 && (
             <>
               <TableContainer>
                 <Table>
                   <TableHead sx={{ bgcolor: 'grey.50' }}>
                     <TableRow>
                       <TableCell><FormattedMessage id="invoice-number" /></TableCell>
                       <TableCell><FormattedMessage id="supplier" /></TableCell>
                       <TableCell><FormattedMessage id="invoice-date" /></TableCell>
                       <TableCell><FormattedMessage id="status" /></TableCell>
                       <TableCell><FormattedMessage id="grand-total" /></TableCell>
                       <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {items.map((invoice) => (
                       <TableRow hover key={invoice.id}>
                         <TableCell><Typography fontWeight={500}>{invoice.number}</Typography></TableCell>
                         <TableCell>{invoice.supplierCode} - {invoice.supplierNameArabic}</TableCell>
                         <TableCell>{invoice.invoiceDate}</TableCell>
                         <TableCell><PurchaseStatusChip status={invoice.status} /></TableCell>
                         <TableCell><Typography fontWeight={600}>{invoice.grandTotal.toFixed(2)} <Typography component="span" variant="caption" color="text.secondary">{intl.formatMessage({ id: 'currency' })}</Typography></Typography></TableCell>
                         <TableCell align="center">
                           <Tooltip title={<FormattedMessage id="details" />}>
                             <IconButton component={Link} to={`/purchases/invoices/${invoice.id}`} color="primary" size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                               <IconEye size={18} />
                             </IconButton>
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
                 sx={{ borderTop: '1px solid', borderColor: 'divider' }}
               />
             </>
           )}
        </Box>
      </MainCard>
    </Box>
  );
}
