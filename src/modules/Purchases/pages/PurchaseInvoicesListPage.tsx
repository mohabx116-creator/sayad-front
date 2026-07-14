import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import { IconPlus, IconRefresh, IconSearch, IconFilter, IconDotsVertical } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { usePurchaseInvoices } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';

// Helper to get initials from supplier name
const getInitials = (name: string) => {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) return words[0].substring(0, 2);
  return `${words[0][0]}${words[1][0]}`;
};

export default function PurchaseInvoicesListPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
           <Breadcrumbs custom card={false} title={false} divider={false} heading="purchase-invoices" links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices' }]} sx={{ mb: 0 }} />
           <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}><FormattedMessage id="purchase-invoices" /></Typography>
         </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
           <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesCreate}>
             <Button component={Link} to="/purchases/invoices/new" variant="contained" color="primary" sx={{ borderRadius: 2, boxShadow: 'none' }} startIcon={<IconPlus size={18} />}>
               <FormattedMessage id="create-purchase-invoice" />
             </Button>
           </PermissionGuard>
        </Stack>
      </Box>

      <MainCard 
         content={false} 
         sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
           <Box sx={{ flexGrow: 1, minWidth: 300 }}>
             <TextField
               size="small"
               fullWidth
               placeholder={intl.formatMessage({ id: 'search-invoice-or-supplier', defaultMessage: 'البحث برقم الفاتورة أو المورد...' })}
               value={search}
               onChange={(event) => { setSearch(event.target.value); setPage(0); }}
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <IconSearch size={18} />
                   </InputAdornment>
                 )
               }}
             />
           </Box>
           <Box sx={{ width: 200 }}>
             <TextField size="small" select fullWidth value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} SelectProps={{ displayEmpty: true }}>
               <MenuItem value=""><FormattedMessage id="all-statuses" defaultMessage="جميع الحالات" /></MenuItem>
               <MenuItem value="Draft"><FormattedMessage id="purchases.status.draft" /></MenuItem>
               <MenuItem value="Posted"><FormattedMessage id="purchases.status.posted" /></MenuItem>
               <MenuItem value="Cancelled"><FormattedMessage id="purchases.status.cancelled" /></MenuItem>
             </TextField>
           </Box>
           <Box sx={{ width: 150 }}>
             <TextField size="small" type="date" fullWidth InputLabelProps={{ shrink: true }} value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(0); }} />
           </Box>
           <Button variant="outlined" color="inherit" startIcon={<IconFilter size={18} />} sx={{ borderRadius: 2 }}>
             <FormattedMessage id="more-filters" defaultMessage="مزيد من الفلاتر" />
           </Button>
           {/* Add a subtle reset button if any filter is active */}
           {(search || status || supplierId || dateFrom || dateTo) && (
             <Tooltip title={<FormattedMessage id="reset-filters" defaultMessage="إعادة ضبط" />}>
               <IconButton onClick={resetFilters} color="primary" size="small">
                 <IconRefresh size={18} />
               </IconButton>
             </Tooltip>
           )}
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
                       <TableCell><FormattedMessage id="supplier-reference" defaultMessage="مرجع المورد" /></TableCell>
                       <TableCell><FormattedMessage id="invoice-date" /></TableCell>
                       <TableCell><FormattedMessage id="supplier" /></TableCell>
                       <TableCell><FormattedMessage id="grand-total" /></TableCell>
                       <TableCell><FormattedMessage id="status" /></TableCell>
                       <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {items.map((invoice) => (
                       <TableRow hover key={invoice.id}>
                         <TableCell>
                           <Typography component={Link} to={`/purchases/invoices/${invoice.id}`} color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                             {invoice.number}
                           </Typography>
                         </TableCell>
                         <TableCell>{invoice.supplierInvoiceNumber || '-'}</TableCell>
                         <TableCell>{invoice.invoiceDate}</TableCell>
                         <TableCell>
                           <Stack direction="row" spacing={1} alignItems="center">
                             <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.lighter', color: 'primary.main' }}>
                               {getInitials(invoice.supplierNameArabic)}
                             </Avatar>
                             <Typography variant="body2">{invoice.supplierNameArabic}</Typography>
                           </Stack>
                         </TableCell>
                         <TableCell><Typography fontWeight={600}>{invoice.grandTotal.toFixed(2)}</Typography></TableCell>
                         <TableCell><PurchaseStatusChip status={invoice.status} /></TableCell>
                         <TableCell align="center">
                           <Tooltip title={<FormattedMessage id="details" />}>
                             <IconButton component={Link} to={`/purchases/invoices/${invoice.id}`} size="small">
                               <IconDotsVertical size={18} />
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
