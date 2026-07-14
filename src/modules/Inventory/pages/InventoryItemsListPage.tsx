import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
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
import { IconEdit, IconEye, IconPackage, IconToggleLeft, IconToggleRight, IconSearch, IconDownload, IconFilter } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { activateItem, deactivateItem } from '../api/inventoryApi';
import { useInventoryItems } from '../hooks/useInventory';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';

export default function InventoryItemsListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const { items, meta, isLoading, error, mutate } = useInventoryItems({ page: page + 1, pageSize, search });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const toggle = async (id: string, active: boolean) => {
    try {
      await (active ? deactivateItem(id) : activateItem(id));
      await mutate();
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="inventory-items" links={[{ title: 'inventory' }, { title: 'inventory-items' }]} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h3" gutterBottom>
            <FormattedMessage id="inventory-items" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة تتبع مخزون المواد الخام والمنتجات النهائية.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="inherit" startIcon={<IconDownload size={18} />}>
            <FormattedMessage id="export" />
          </Button>
          <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsCreate}>
            <Button component={Link} to="/inventory/items/new" variant="contained" startIcon={<IconPackage size={18} />}>
              <FormattedMessage id="create-item" />
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" color="inherit" startIcon={<IconFilter size={18} />}>
              <FormattedMessage id="filter" />
            </Button>
            <Button variant="outlined" color="inherit">
              <FormattedMessage id="all-categories" />
            </Button>
            <Button variant="outlined" color="inherit">
              <FormattedMessage id="stock-status-filter" />
            </Button>
          </Stack>
          <Box sx={{ width: 300 }}>
            <TextField 
              fullWidth 
              size="small"
              placeholder={intl.formatMessage({ id: 'search' })} 
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
        </Box>
        
        {isLoading && <Box sx={{ p: 2 }}><Loader /></Box>}
        {error && <Box sx={{ p: 2 }}><Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography></Box>}
        {!isLoading && items.length === 0 && <Box sx={{ p: 2 }}><Typography><FormattedMessage id="inventory-empty-items" /></Typography></Box>}
        
        {items.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="item-code" /></TableCell>
                    <TableCell><FormattedMessage id="name" /></TableCell>
                    <TableCell><FormattedMessage id="item-type" /></TableCell>
                    <TableCell><FormattedMessage id="unit" /></TableCell>
                    <TableCell><FormattedMessage id="current-quantity" /></TableCell>
                    <TableCell><FormattedMessage id="stock-status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const isOutOfStock = item.currentQuantity <= 0;
                    const isCritical = item.stockStatus === 'Critical' || item.stockStatus === 'Out of Stock';
                    const isLow = item.stockStatus === 'Low' || item.stockStatus === 'BelowMinimum';
                    
                    const statusColor = isOutOfStock ? 'error' : (isCritical ? 'error' : (isLow ? 'warning' : 'success'));
                    const qtyColor = isOutOfStock ? 'error.main' : (isCritical ? 'error.main' : (isLow ? 'warning.dark' : 'text.primary'));
                    const chipVariant = isOutOfStock ? 'filled' : 'outlined';
                    const chipBg = isOutOfStock ? 'error.main' : `${statusColor}.lighter`;
                    const chipText = isOutOfStock ? 'white' : undefined;
                    
                    // Normalize the label
                    let label = item.stockStatus;
                    if (isOutOfStock) label = intl.formatMessage({ id: 'out-of-stock', defaultMessage: 'نفد من المخزون' });
                    else if (item.stockStatus === 'BelowMinimum') label = intl.formatMessage({ id: 'below-minimum', defaultMessage: 'أقل من الحد' });
                    else if (item.stockStatus === 'Normal') label = intl.formatMessage({ id: 'normal', defaultMessage: 'طبيعي' });

                    return (
                      <TableRow hover key={item.id} sx={{ bgcolor: isOutOfStock ? 'error.lighter' : 'inherit' }}>
                        <TableCell>
                          <Typography component={Link} to={`/inventory/items/${item.id}`} color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                            {item.code}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{item.nameArabic}</TableCell>
                        <TableCell>{item.itemType}</TableCell>
                        <TableCell>{item.baseUnitCode}</TableCell>
                        <TableCell>
                           <Typography fontWeight={isOutOfStock || isCritical || isLow ? 800 : 500} color={qtyColor} sx={{ fontSize: isOutOfStock || isCritical || isLow ? '1.1rem' : '1rem' }}>
                              {item.currentQuantity}
                           </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={label} 
                            color={statusColor} 
                            size="small" 
                            variant={chipVariant}
                            sx={{ 
                              bgcolor: chipBg,
                              color: chipText,
                              border: 'none',
                              fontWeight: 700,
                              px: 1
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title={<FormattedMessage id="details" />}>
                              <IconButton size="small" component={Link} to={`/inventory/items/${item.id}`}><IconEye size={18} /></IconButton>
                            </Tooltip>
                            <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsUpdate}>
                              <Tooltip title={<FormattedMessage id="edit" />}>
                                <IconButton size="small" component={Link} to={`/inventory/items/${item.id}/edit`}><IconEdit size={18} /></IconButton>
                              </Tooltip>
                            </PermissionGuard>
                            {/* Toggle visibility based on permissions, not prominent in design but required for functionality */}
                            <PermissionGuard permission={item.isActive ? INVENTORY_PERMISSIONS.itemsDeactivate : INVENTORY_PERMISSIONS.itemsActivate}>
                              <Tooltip title={<FormattedMessage id={item.isActive ? 'deactivate' : 'activate'} />}>
                                <IconButton size="small" onClick={() => toggle(item.id, item.isActive)}>
                                  {item.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                                </IconButton>
                              </Tooltip>
                            </PermissionGuard>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
