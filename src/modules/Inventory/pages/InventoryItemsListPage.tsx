import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
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
import { IconEdit, IconEye, IconPackage, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';

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
      <MainCard
        title={<FormattedMessage id="inventory-items" />}
        secondary={
          <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsCreate}>
            <Button component={Link} to="/inventory/items/new" variant="contained" startIcon={<IconPackage size={18} />}>
              <FormattedMessage id="create-item" />
            </Button>
          </PermissionGuard>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="search" />} value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
          </Grid>
        </Grid>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>}
        {!isLoading && items.length === 0 && <Typography><FormattedMessage id="inventory-empty-items" /></Typography>}
        {items.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="item-code" /></TableCell>
                    <TableCell><FormattedMessage id="name" /></TableCell>
                    <TableCell><FormattedMessage id="item-type" /></TableCell>
                    <TableCell><FormattedMessage id="current-quantity" /></TableCell>
                    <TableCell><FormattedMessage id="stock-status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow hover key={item.id}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.nameArabic}</TableCell>
                      <TableCell>{item.itemType}</TableCell>
                      <TableCell>{item.currentQuantity} {item.baseUnitCode}</TableCell>
                      <TableCell><Chip label={item.stockStatus} color={item.stockStatus === 'Normal' ? 'success' : 'warning'} size="small" /></TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={<FormattedMessage id="details" />}>
                            <IconButton component={Link} to={`/inventory/items/${item.id}`}><IconEye size={18} /></IconButton>
                          </Tooltip>
                          <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsUpdate}>
                            <Tooltip title={<FormattedMessage id="edit" />}>
                              <IconButton component={Link} to={`/inventory/items/${item.id}/edit`}><IconEdit size={18} /></IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard permission={item.isActive ? INVENTORY_PERMISSIONS.itemsDeactivate : INVENTORY_PERMISSIONS.itemsActivate}>
                            <Tooltip title={<FormattedMessage id={item.isActive ? 'deactivate' : 'activate'} />}>
                              <IconButton onClick={() => toggle(item.id, item.isActive)}>
                                {item.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                        </Stack>
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
