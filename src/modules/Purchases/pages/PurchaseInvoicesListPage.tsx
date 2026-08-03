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
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VerifiedIcon from '@mui/icons-material/Verified';
import DraftsIcon from '@mui/icons-material/Drafts';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { IconPlus, IconRefresh, IconSearch, IconFilter, IconDotsVertical } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import HoverDataCard from 'ui-component/cards/HoverDataCard';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import PurchaseAccountingStatusChip from '../components/PurchaseAccountingStatusChip';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { usePurchaseInvoices } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';

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

  const { meta: totalMeta, isLoading: totalLoading, error: totalError } = usePurchaseInvoices({ page: 1, pageSize: 1 });
  const { meta: postedMeta, isLoading: postedLoading, error: postedError } = usePurchaseInvoices({ page: 1, pageSize: 1, status: 'Posted' });
  const { meta: draftMeta, isLoading: draftLoading, error: draftError } = usePurchaseInvoices({ page: 1, pageSize: 1, status: 'Draft' });
  const { meta: cancelledMeta, isLoading: cancelledLoading, error: cancelledError } = usePurchaseInvoices({ page: 1, pageSize: 1, status: 'Cancelled' });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoice: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        <Breadcrumbs
          custom
          heading="purchase-invoices"
          links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices' }]}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              <FormattedMessage id="purchase-invoices" />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              <FormattedMessage id="purchase-invoices-page-description" defaultMessage="إدارة قائمة فواتير المشتريات" />
            </Typography>
          </Box>
          <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesCreate}>
             <Button component={Link} to="/purchases/invoices/new" variant="contained" startIcon={<IconPlus size={18} />}>
               <FormattedMessage id="create-purchase-invoice" />
             </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          {totalLoading ? <Skeleton variant="rounded" height={100} /> : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'total-purchase-invoices' })}
              primary={totalError ? '-' : totalMeta?.totalCount ?? 0}
              secondary={intl.formatMessage({ id: 'all-statuses' })}
              iconPrimary={ReceiptIcon}
              color="primary.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {postedLoading ? <Skeleton variant="rounded" height={100} /> : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'posted-purchase-invoices' })}
              primary={postedError ? '-' : postedMeta?.totalCount ?? 0}
              secondary={intl.formatMessage({ id: 'purchases.status.posted' })}
              iconPrimary={VerifiedIcon}
              color="success.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {draftLoading ? <Skeleton variant="rounded" height={100} /> : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'draft-purchase-invoices' })}
              primary={draftError ? '-' : draftMeta?.totalCount ?? 0}
              secondary={intl.formatMessage({ id: 'purchases.status.draft' })}
              iconPrimary={DraftsIcon}
              color="warning.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {cancelledLoading ? <Skeleton variant="rounded" height={100} /> : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'cancelled-purchase-invoices' })}
              primary={cancelledError ? '-' : cancelledMeta?.totalCount ?? 0}
              secondary={intl.formatMessage({ id: 'purchases.status.cancelled' })}
              iconPrimary={CancelIcon}
              color="error.main"
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
                         <TableCell><Typography fontWeight={600}>{formatTreasuryMoney(invoice.grandTotal, invoice.currencyCode)}</Typography></TableCell>
                         <TableCell>
                           <Stack spacing={0.75} alignItems="flex-start">
                             <PurchaseStatusChip status={invoice.status} />
                             <PurchaseAccountingStatusChip
                               isAccountingPosted={invoice.isAccountingPosted}
                               accountingPostingStatus={invoice.accountingPostingStatus}
                             />
                           </Stack>
                         </TableCell>
                         <TableCell align="center">
                           <Tooltip title={<FormattedMessage id="actions" />}>
                             <IconButton onClick={(e) => handleMenuOpen(e, invoice)} size="small">
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem component={Link} to={`/purchases/invoices/${selectedInvoice?.id}`} onClick={handleMenuClose}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText><FormattedMessage id="view-invoice" defaultMessage="عرض الفاتورة" /></ListItemText>
        </MenuItem>
        {selectedInvoice?.status === 'Draft' && (
          <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesUpdate}>
            <MenuItem component={Link} to={`/purchases/invoices/${selectedInvoice?.id}/edit`} onClick={handleMenuClose}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText><FormattedMessage id="edit-invoice" defaultMessage="تعديل الفاتورة" /></ListItemText>
            </MenuItem>
          </PermissionGuard>
        )}
        <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsCreate}>
          <MenuItem component={Link} to={`/purchases/returns/new?purchaseInvoiceId=${selectedInvoice?.id}`} onClick={handleMenuClose}>
            <ListItemIcon><AssignmentReturnIcon fontSize="small" /></ListItemIcon>
            <ListItemText><FormattedMessage id="create-purchase-return" defaultMessage="إنشاء مرتجع مشتريات" /></ListItemText>
          </MenuItem>
        </PermissionGuard>
      </Menu>
    </Box>
  );
}
