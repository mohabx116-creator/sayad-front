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
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VerifiedIcon from '@mui/icons-material/Verified';
import DraftsIcon from '@mui/icons-material/Drafts';
import HoverDataCard from 'ui-component/cards/HoverDataCard';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import SalesAccountingStatusChip from '../components/SalesAccountingStatusChip';
import SalesStatusChip from '../components/SalesStatusChip';
import { useSalesInvoices } from '../hooks/useSales';
import { SALES_PERMISSIONS } from '../utils/sales.constants';

// Helper to get initials from customer name
const getInitials = (name: string) => {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) return words[0].substring(0, 2);
  return `${words[0][0]}${words[1][0]}`;
};

export default function SalesInvoicesListPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { items, meta, isLoading, error } = useSalesInvoices({ 
     page: page + 1, 
     pageSize, 
     search, 
     status, 
     customerId,
     dateFrom,
     dateTo,
     sortBy: 'invoiceDate', 
     sortDirection: 'desc' 
  });

  const {
    meta: totalMeta,
    isLoading: totalLoading,
    error: totalError
  } = useSalesInvoices({ page: 1, pageSize: 1 });

  const {
    meta: postedMeta,
    isLoading: postedLoading,
    error: postedError
  } = useSalesInvoices({ page: 1, pageSize: 1, status: 'Posted' });

  const {
    meta: draftMeta,
    isLoading: draftLoading,
    error: draftError
  } = useSalesInvoices({ page: 1, pageSize: 1, status: 'Draft' });

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setCustomerId('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        <Breadcrumbs
          custom
          heading="sales-invoices"
          links={[{ title: 'sales' }, { title: 'sales-invoices' }]}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              <FormattedMessage id="sales-invoices" />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              <FormattedMessage id="sales-invoices-page-description" />
            </Typography>
          </Box>
          <PermissionGuard permission={SALES_PERMISSIONS.invoicesCreate}>
             <Button component={Link} to="/sales/invoices/new" variant="contained" startIcon={<IconPlus size={18} />}>
               <FormattedMessage id="create-sales-invoice" />
             </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          {totalLoading ? <Skeleton variant="rounded" height={100} /> : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'total-invoices' })}
              primary={totalError ? '-' : totalMeta?.totalCount ?? 0}
              secondary={intl.formatMessage({ id: 'all-statuses' })}
              iconPrimary={ReceiptIcon}
              color="primary.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={4}>
          {postedLoading ? <Skeleton variant="rounded" height={100} /> : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'posted-invoices' })}
              primary={postedError ? '-' : postedMeta?.totalCount ?? 0}
              secondary={intl.formatMessage({ id: 'sales.status.posted' })}
              iconPrimary={VerifiedIcon}
              color="success.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={4}>
          {draftLoading ? <Skeleton variant="rounded" height={100} /> : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'draft-invoices' })}
              primary={draftError ? '-' : draftMeta?.totalCount ?? 0}
              secondary={intl.formatMessage({ id: 'sales.status.draft' })}
              iconPrimary={DraftsIcon}
              color="warning.main"
            />
          )}
        </Grid>
      </Grid>

      <MainCard 
         content={false} 
         sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
           <Box sx={{ flexGrow: 1, minWidth: 300 }}>
             <TextField
               size="small"
               fullWidth
               placeholder={intl.formatMessage({ id: 'search-invoice-or-customer', defaultMessage: 'البحث برقم الفاتورة أو اسم العميل...' })}
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
               <MenuItem value="Draft"><FormattedMessage id="sales.status.draft" /></MenuItem>
               <MenuItem value="Posted"><FormattedMessage id="sales.status.posted" /></MenuItem>
               <MenuItem value="Cancelled"><FormattedMessage id="sales.status.cancelled" /></MenuItem>
             </TextField>
           </Box>
           <Box sx={{ width: 150 }}>
             <TextField size="small" type="date" fullWidth InputLabelProps={{ shrink: true }} value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(0); }} />
           </Box>
           <Button variant="outlined" color="inherit" startIcon={<IconFilter size={18} />} sx={{ borderRadius: 2 }}>
             <FormattedMessage id="more-filters" defaultMessage="مزيد من الفلاتر" />
           </Button>
           {/* Add a subtle reset button if any filter is active */}
           {(search || status || customerId || dateFrom || dateTo) && (
             <Tooltip title={<FormattedMessage id="reset-filters" defaultMessage="إعادة ضبط" />}>
               <IconButton onClick={resetFilters} color="primary" size="small">
                 <IconRefresh size={18} />
               </IconButton>
             </Tooltip>
           )}
        </Box>

        <Box sx={{ p: 0 }}>
           {isLoading && <Loader />}
           {error && <Box p={3}><Typography color="error">{intl.formatMessage({ id: 'sales-load-error' })}</Typography></Box>}
           {!isLoading && items.length === 0 && <Box p={3}><Typography color="text.secondary" textAlign="center">{intl.formatMessage({ id: 'sales-empty' })}</Typography></Box>}
           
           {items.length > 0 && (
             <>
               <TableContainer>
                 <Table>
                   <TableHead sx={{ bgcolor: 'grey.50' }}>
                     <TableRow>
                       <TableCell><FormattedMessage id="invoice-number" /></TableCell>
                       <TableCell><FormattedMessage id="invoice-date" /></TableCell>
                       <TableCell><FormattedMessage id="customer" /></TableCell>
                       <TableCell><FormattedMessage id="grand-total" /></TableCell>
                       <TableCell><FormattedMessage id="status" /></TableCell>
                       <TableCell><FormattedMessage id="accounting" /></TableCell>
                       <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {items.map((invoice) => (
                       <TableRow hover key={invoice.id}>
                         <TableCell>
                           <Typography component={Link} to={`/sales/invoices/${invoice.id}`} color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                             {invoice.number}
                           </Typography>
                         </TableCell>
                         <TableCell>{invoice.invoiceDate}</TableCell>
                         <TableCell>
                           <Stack direction="row" spacing={1} alignItems="center">
                             <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.lighter', color: 'primary.main' }}>
                               {getInitials(invoice.customerNameArabic)}
                             </Avatar>
                             <Typography variant="body2">{invoice.customerNameArabic}</Typography>
                           </Stack>
                         </TableCell>
                         <TableCell><Typography fontWeight={600}>{invoice.grandTotal.toFixed(2)}</Typography></TableCell>
                         <TableCell><SalesStatusChip status={invoice.status} /></TableCell>
                         <TableCell>
                           <SalesAccountingStatusChip
                             isAccountingPosted={invoice.isAccountingPosted}
                             accountingPostingStatus={invoice.accountingPostingStatus}
                           />
                         </TableCell>
                         <TableCell align="center">
                           <Tooltip title={<FormattedMessage id="details" />}>
                             <IconButton component={Link} to={`/sales/invoices/${invoice.id}`} size="small">
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
