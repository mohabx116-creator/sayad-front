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
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import PurchaseAccountingStatusChip from '../components/PurchaseAccountingStatusChip';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { usePurchaseReturns } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';
import { useParties } from 'modules/Parties/hooks/useParties';

export default function PurchaseReturnsListPage() {
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

  const { items, meta, isLoading, error } = usePurchaseReturns({ 
     page: page + 1, 
     pageSize, 
     search, 
     status, 
     supplierId,
     dateFrom,
     dateTo,
     sortBy: 'returnDate', 
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
           <Breadcrumbs custom card={false} title={false} divider={false} heading="purchase-returns" links={[{ title: 'purchases', to: '/purchases/returns' }, { title: 'purchase-returns' }]} sx={{ mb: 0 }} />
           <PageTitle><FormattedMessage id="purchase-returns" /></PageTitle>
         </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
           <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsCreate}>
             <Button component={Link} to="/purchases/returns/new" variant="contained" color="primary" sx={{ borderRadius: 2, boxShadow: 2 }} startIcon={<IconPlus size={18} />}>
               <FormattedMessage id="create-purchase-return" />
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
               <TextField size="small" type="date" fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="date-from" />} value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(0); }} />
             </Grid>
             <Grid item xs={6} md={1.5}>
               <TextField size="small" type="date" fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="date-to" />} value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(0); }} />
             </Grid>
              <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                 <Tooltip title={<FormattedMessage id="reset-filters" />}>
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
                        <TableCell><FormattedMessage id="return-number" /></TableCell>
                       <TableCell><FormattedMessage id="purchase-invoice" /></TableCell>
                       <TableCell><FormattedMessage id="return-date" /></TableCell>
                       <TableCell><FormattedMessage id="status" /></TableCell>
                       <TableCell><FormattedMessage id="grand-total" /></TableCell>
                       <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                      </TableRow>
                   </TableHead>
                   <TableBody>
                     {items.map((purchaseReturn) => (
                       <TableRow hover key={purchaseReturn.id}>
                         <TableCell><Typography fontWeight={500}>{purchaseReturn.number}</Typography></TableCell>
                         <TableCell>{purchaseReturn.purchaseInvoiceNumber}</TableCell>
                         <TableCell>{purchaseReturn.returnDate}</TableCell>
                         <TableCell>
                           <Stack spacing={0.75} alignItems="flex-start">
                             <PurchaseStatusChip status={purchaseReturn.status} />
                             <PurchaseAccountingStatusChip
                               isAccountingPosted={purchaseReturn.isAccountingPosted}
                               accountingPostingStatus={purchaseReturn.accountingPostingStatus}
                             />
                           </Stack>
                         </TableCell>
                         <TableCell><Typography fontWeight={600}>{purchaseReturn.grandTotal.toFixed(2)} <Typography component="span" variant="caption" color="text.secondary">{intl.formatMessage({ id: 'currency' })}</Typography></Typography></TableCell>
                         <TableCell align="center">
                           <Tooltip title={<FormattedMessage id="details" />}>
                             <IconButton component={Link} to={`/purchases/returns/${purchaseReturn.id}`} color="primary" size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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
                 labelRowsPerPage={<FormattedMessage id="rows-per-page" />}
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
