import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconEye, IconPlus, IconSearch } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useInventoryWarehouses } from '../hooks/useInventory';
import { useCustomerMaterialIntakes } from '../hooks/useCustomerMaterials';
import CustomerMaterialsTabs from '../components/customer-materials/CustomerMaterialsTabs';
import CustomerMaterialStatusChip from '../components/customer-materials/CustomerMaterialStatusChip';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';

export default function CustomerMaterialIntakesListPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { items: customers } = useParties({ page: 1, pageSize: 100, isCustomer: true, sortBy: 'nameArabic' });
  const { warehouses } = useInventoryWarehouses();

  const query = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      search: search.trim() || undefined,
      status: status || undefined,
      customerId: customerId || undefined,
      warehouseId: warehouseId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    }),
    [customerId, dateFrom, dateTo, page, pageSize, search, status, warehouseId]
  );
  const { items, meta, isLoading, error, mutate } = useCustomerMaterialIntakes(query);

  return (
    <Box>
      <Breadcrumbs custom heading="customer-materials" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'customer-materials' }]} />
      <CustomerMaterialsTabs value="intakes" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            <FormattedMessage id="customer-material-intakes" defaultMessage="Customer Materials" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage
              id="customer-material-intakes-page-description"
              defaultMessage="Manage customer-owned material receipts held in custody."
            />
          </Typography>
        </Box>

        <PermissionGuard permission={INVENTORY_PERMISSIONS.customerMaterialIntakesCreate}>
          <Button component={Link} to="/inventory/customer-materials/intakes/new" variant="contained" startIcon={<IconPlus size={18} />}>
            <FormattedMessage id="create" defaultMessage="Create" />
          </Button>
        </PermissionGuard>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label={<FormattedMessage id="search" />}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                InputProps={{ startAdornment: <IconSearch size={16} style={{ marginInlineEnd: 8, opacity: 0.7 }} /> }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth size="small" label={<FormattedMessage id="status" />} value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
                <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
                <MenuItem value="Draft"><FormattedMessage id="draft" /></MenuItem>
                <MenuItem value="Posted"><FormattedMessage id="posted" /></MenuItem>
                <MenuItem value="Cancelled"><FormattedMessage id="cancelled" /></MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth size="small" label={<FormattedMessage id="customer" />} value={customerId} onChange={(event) => { setCustomerId(event.target.value); setPage(0); }}>
                <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.code} - {customer.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth size="small" label={<FormattedMessage id="warehouse" />} value={warehouseId} onChange={(event) => { setWarehouseId(event.target.value); setPage(0); }}>
                <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField type="date" fullWidth size="small" label={<FormattedMessage id="app.dateFrom" defaultMessage="Date From" />} InputLabelProps={{ shrink: true }} value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(0); }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField type="date" fullWidth size="small" label={<FormattedMessage id="app.dateTo" defaultMessage="Date To" />} InputLabelProps={{ shrink: true }} value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(0); }} />
            </Grid>
          </Grid>
        </Box>

        {isLoading ? (
          <Box sx={{ p: 4 }}>
            <Loader />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">
              <FormattedMessage id="inventory-load-error" defaultMessage="Unable to load inventory data." />
            </Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              <FormattedMessage id="customer-materials-empty" defaultMessage="No customer material intakes found." />
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="document-number" defaultMessage="Document No." /></TableCell>
                    <TableCell><FormattedMessage id="date" /></TableCell>
                    <TableCell><FormattedMessage id="customer" /></TableCell>
                    <TableCell><FormattedMessage id="warehouse" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="quantity" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow hover key={item.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{item.number}</TableCell>
                      <TableCell dir="ltr">{item.intakeDate}</TableCell>
                      <TableCell>{item.ownerPartyCode} - {item.ownerPartyNameArabic}</TableCell>
                      <TableCell>{item.warehouseCode} - {item.warehouseNameArabic}</TableCell>
                      <TableCell align="right">{intl.formatNumber(item.totalBaseQuantity, { maximumFractionDigits: 4 })}</TableCell>
                      <TableCell align="center"><CustomerMaterialStatusChip status={item.status} /></TableCell>
                      <TableCell align="right">
                        <Button component={Link} to={`/inventory/customer-materials/intakes/${item.id}`} size="small" startIcon={<IconEye size={16} />}>
                          <FormattedMessage id="details" />
                        </Button>
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
              onRowsPerPageChange={(event) => {
                setPageSize(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </MainCard>
    </Box>
  );
}
