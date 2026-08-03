import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  IconEdit,
  IconEye,
  IconPackage,
  IconRefresh,
  IconReportAnalytics,
  IconSearch,
  IconToggleLeft,
  IconToggleRight
} from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import { activateItem, deactivateItem } from '../api/inventoryApi';
import { useInventoryCategories, useInventoryItems, useInventoryStockReport } from '../hooks/useInventory';
import { INVENTORY_PERMISSIONS, ITEM_TYPES } from '../utils/inventory.constants';

type ItemStatusFilter = 'All' | 'Normal' | 'BelowMinimum' | 'ReorderRequired' | 'OutOfStock' | 'Negative';
type ActiveFilter = 'All' | 'Active' | 'Inactive';

type SummaryCardProps = {
  labelId: string;
  defaultMessage: string;
  value: string;
  onClick?: () => void;
  selected?: boolean;
  selectable?: boolean;
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}

function SummaryCard({ labelId, defaultMessage, value, onClick, selected = false, selectable = false }: SummaryCardProps) {
  const content = (
    <Box
      sx={(theme) => ({
        width: '100%',
        minHeight: 112,
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'primary.main' : 'background.paper',
        color: selected ? 'primary.contrastText' : 'text.primary',
        boxShadow: selected ? theme.shadows[4] : theme.shadows[0],
        transition: 'all .18s ease',
        transform: selected ? 'translateY(-1px)' : 'translateY(0)',
        '&:hover': {
          boxShadow: selected ? theme.shadows[6] : theme.shadows[2]
        }
      })}
    >
      <Typography variant="body2" sx={{ opacity: selected ? 0.9 : 0.72 }}>
        <FormattedMessage id={labelId} defaultMessage={defaultMessage} />
      </Typography>
      <Typography variant="h3" sx={{ mt: 1 }}>
        {value}
      </Typography>
    </Box>
  );

  if (!selectable || !onClick) {
    return <MainCard content={false} sx={{ height: '100%' }}>{content}</MainCard>;
  }

  return (
    <ButtonBase onClick={onClick} aria-pressed={selected} sx={{ width: '100%', height: '100%', textAlign: 'left', borderRadius: 3 }}>
      {content}
    </ButtonBase>
  );
}

function formatQuantity(intl: ReturnType<typeof useIntl>, value?: number | null) {
  return value == null ? '-' : intl.formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}

function formatMoney(intl: ReturnType<typeof useIntl>, value?: number | null) {
  return value == null ? '-' : intl.formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function getItemTypeLabel(intl: ReturnType<typeof useIntl>, itemType: string) {
  switch (itemType) {
    case 'RawMaterial':
      return intl.formatMessage({ id: 'item-type.raw-material', defaultMessage: 'Raw material' });
    case 'FinishedGood':
      return intl.formatMessage({ id: 'item-type.finished-good', defaultMessage: 'Finished good' });
    case 'PackagingMaterial':
      return intl.formatMessage({ id: 'item-type.packaging-material', defaultMessage: 'Packaging material' });
    case 'OperationalSupply':
      return intl.formatMessage({ id: 'item-type.operational-supply', defaultMessage: 'Operational supply' });
    default:
      return intl.formatMessage({ id: 'item-type.other', defaultMessage: 'Other' });
  }
}

function getItemStatusLabel(intl: ReturnType<typeof useIntl>, status: ItemStatusFilter) {
  switch (status) {
    case 'Normal':
      return intl.formatMessage({ id: 'inventory-item-stock-status.normal', defaultMessage: 'Normal' });
    case 'BelowMinimum':
      return intl.formatMessage({ id: 'inventory-item-stock-status.below-minimum', defaultMessage: 'Below minimum' });
    case 'ReorderRequired':
      return intl.formatMessage({ id: 'inventory-item-stock-status.reorder-required', defaultMessage: 'Reorder required' });
    case 'OutOfStock':
      return intl.formatMessage({ id: 'inventory-item-stock-status.out-of-stock', defaultMessage: 'Out of stock' });
    case 'Negative':
      return intl.formatMessage({ id: 'inventory-item-stock-status.negative', defaultMessage: 'Negative stock' });
    default:
      return intl.formatMessage({ id: 'all-status', defaultMessage: 'All statuses' });
  }
}

function getItemStatusColor(status: ItemStatusFilter) {
  switch (status) {
    case 'Normal':
      return 'success';
    case 'BelowMinimum':
    case 'ReorderRequired':
      return 'warning';
    case 'OutOfStock':
    case 'Negative':
      return 'error';
    default:
      return 'default';
  }
}

function mapSummaryStatusForReport(status: ItemStatusFilter) {
  switch (status) {
    case 'Normal':
      return 'Available';
    case 'BelowMinimum':
    case 'ReorderRequired':
      return 'LowStock';
    case 'OutOfStock':
    case 'Negative':
      return 'OutOfStock';
    default:
      return undefined;
  }
}

export default function InventoryItemsListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [itemType, setItemType] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('All');
  const [statusFilter, setStatusFilter] = useState<ItemStatusFilter>('All');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  const categoryQuery = useMemo(() => ({ page: 1, pageSize: 100, isActive: true }), []);
  const { items: categories, isLoading: categoriesLoading } = useInventoryCategories(categoryQuery);

  const itemsQuery = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
      itemType: itemType || undefined,
      isActive: activeFilter === 'All' ? undefined : activeFilter === 'Active',
      stockStatus: statusFilter === 'All' ? undefined : statusFilter
    }),
    [activeFilter, categoryId, debouncedSearch, itemType, page, pageSize, statusFilter]
  );

  const reportQuery = useMemo(
    () => ({
      page: 1,
      pageSize: 1,
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
      stockStatus: mapSummaryStatusForReport(statusFilter)
    }),
    [categoryId, debouncedSearch, statusFilter]
  );

  const { items, meta, isLoading, error, mutate } = useInventoryItems(itemsQuery);
  const { report, isLoading: reportLoading, mutate: mutateReport } = useInventoryStockReport(reportQuery);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refreshAll = async () => {
    await Promise.all([mutate(), mutateReport()]);
  };

  const toggle = async (id: string, active: boolean) => {
    try {
      await (active ? deactivateItem(id) : activateItem(id));
      await refreshAll();
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    }
  };

  const summary = report?.summary;
  const summaryCards = useMemo(
    () => [
      {
        key: 'all',
        labelId: 'stock-summary.total-items',
        defaultMessage: 'Total Items',
        value: intl.formatNumber(summary?.totalItems ?? 0),
        selected: statusFilter === 'All',
        selectable: true,
        onClick: () => setStatusFilter('All')
      },
      {
        key: 'available',
        labelId: 'stock-summary.available-items',
        defaultMessage: 'Available',
        value: intl.formatNumber(summary?.availableItems ?? 0),
        selected: statusFilter === 'Normal',
        selectable: true,
        onClick: () => setStatusFilter('Normal')
      },
      {
        key: 'low-stock',
        labelId: 'stock-summary.low-stock-items',
        defaultMessage: 'Low Stock',
        value: intl.formatNumber(summary?.lowStockItems ?? 0),
        selected: statusFilter === 'BelowMinimum' || statusFilter === 'ReorderRequired',
        selectable: true,
        onClick: () => setStatusFilter('BelowMinimum')
      },
      {
        key: 'out-of-stock',
        labelId: 'stock-summary.out-of-stock-items',
        defaultMessage: 'Out of Stock',
        value: intl.formatNumber(summary?.outOfStockItems ?? 0),
        selected: statusFilter === 'OutOfStock' || statusFilter === 'Negative',
        selectable: true,
        onClick: () => setStatusFilter('OutOfStock')
      },
      {
        key: 'value',
        labelId: 'total-stock-value',
        defaultMessage: 'Total Inventory Value',
        value: formatMoney(intl, summary?.totalInventoryValue),
        selectable: false
      }
    ],
    [intl, statusFilter, summary?.availableItems, summary?.lowStockItems, summary?.outOfStockItems, summary?.totalInventoryValue, summary?.totalItems]
  );

  return (
    <>
      <Breadcrumbs custom heading="inventory-items-overview" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'inventory-items' }]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconPackage color="var(--mui-palette-primary-main)" size={28} />
            <FormattedMessage id="inventory-items-overview" defaultMessage="Inventory Items Overview" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage
              id="inventory-items-overview-help"
              defaultMessage="Monitor stock health, inventory value, and item activity from a single operational screen."
            />
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button variant="outlined" color="inherit" startIcon={<IconRefresh size={18} />} onClick={() => void refreshAll()}>
            <FormattedMessage id="refresh" />
          </Button>
          <PermissionGuard permission={INVENTORY_PERMISSIONS.view}>
            <Button component={Link} to="/inventory/reports/stock" variant="outlined" color="inherit" startIcon={<IconReportAnalytics size={18} />}>
              <FormattedMessage id="inventory-stock-report" defaultMessage="Stock Report" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsCreate}>
            <Button component={Link} to="/inventory/items/new" variant="contained" startIcon={<IconPackage size={18} />}>
              <FormattedMessage id="create-item" />
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              labelId={card.labelId}
              defaultMessage={card.defaultMessage}
              value={card.value}
              selectable={card.selectable}
              selected={card.selected ?? false}
              onClick={card.onClick}
            />
          </Grid>
        ))}
      </Grid>

      <MainCard content={false}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label={<FormattedMessage id="search" />}
                placeholder={intl.formatMessage({ id: 'search-item', defaultMessage: 'Search item...' })}
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="item-category" />}
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setPage(0);
                }}
                disabled={categoriesLoading}
              >
                <MenuItem value="">
                  <FormattedMessage id="all-categories" />
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.code} - {category.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="item-type" />}
                value={itemType}
                onChange={(event) => {
                  setItemType(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" />
                </MenuItem>
                {ITEM_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {getItemTypeLabel(intl, type)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="status" />}
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(event.target.value as ActiveFilter);
                  setPage(0);
                }}
              >
                <MenuItem value="All">
                  <FormattedMessage id="all-status" />
                </MenuItem>
                <MenuItem value="Active">
                  <FormattedMessage id="active" />
                </MenuItem>
                <MenuItem value="Inactive">
                  <FormattedMessage id="inactive" />
                </MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="stock-status-filter" />}
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as ItemStatusFilter);
                  setPage(0);
                }}
              >
                <MenuItem value="All">
                  <FormattedMessage id="stock-status.all" />
                </MenuItem>
                <MenuItem value="Normal">{getItemStatusLabel(intl, 'Normal')}</MenuItem>
                <MenuItem value="BelowMinimum">{getItemStatusLabel(intl, 'BelowMinimum')}</MenuItem>
                <MenuItem value="ReorderRequired">{getItemStatusLabel(intl, 'ReorderRequired')}</MenuItem>
                <MenuItem value="OutOfStock">{getItemStatusLabel(intl, 'OutOfStock')}</MenuItem>
                <MenuItem value="Negative">{getItemStatusLabel(intl, 'Negative')}</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setSearchInput('');
                  setCategoryId('');
                  setItemType('');
                  setActiveFilter('All');
                  setStatusFilter('All');
                  setPage(0);
                }}
              >
                <FormattedMessage id="reset-filters" />
              </Button>
            </Grid>
          </Grid>
        </Box>

        {(isLoading || reportLoading) && (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <Loader />
          </Box>
        )}

        {!isLoading && !error && items.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <IconPackage size={48} color="var(--mui-palette-grey-400)" />
            <Typography variant="h4" color="text.secondary" sx={{ mt: 2 }}>
              <FormattedMessage id="inventory-no-matching-items" defaultMessage="No matching items were found." />
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 4 }}>
            <Typography color="error">
              <FormattedMessage id="inventory-load-error" />
            </Typography>
          </Box>
        )}

        {!isLoading && !error && items.length > 0 && (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1500 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="item-code" /></TableCell>
                    <TableCell><FormattedMessage id="item-name" /></TableCell>
                    <TableCell><FormattedMessage id="item-category" /></TableCell>
                    <TableCell><FormattedMessage id="item-type" /></TableCell>
                    <TableCell><FormattedMessage id="unit" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="current-quantity" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="minimum-stock" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="reorder-quantity" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="average-unit-cost" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="inventory-value" /></TableCell>
                    <TableCell><FormattedMessage id="stock-status" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const status = item.stockStatus as ItemStatusFilter;
                    const stockStatusColor = getItemStatusColor(status);
                    const stockStatusLabel = getItemStatusLabel(intl, status);

                    return (
                      <TableRow
                        hover
                        key={item.id}
                        sx={{
                          bgcolor:
                            status === 'OutOfStock' || status === 'Negative'
                              ? 'error.lighter'
                              : status === 'BelowMinimum' || status === 'ReorderRequired'
                                ? 'warning.lighter'
                                : 'inherit',
                          opacity: item.isActive ? 1 : 0.72
                        }}
                      >
                        <TableCell>
                          <Typography component={Link} to={`/inventory/items/${item.id}`} color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                            {item.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{item.nameArabic}</Typography>
                          {item.nameEnglish && (
                            <Typography variant="caption" color="text.secondary" component="div">
                              {item.nameEnglish}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{item.categoryNameArabic ?? '-'}</TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={getItemTypeLabel(intl, item.itemType)} />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{item.baseUnitCode}</Typography>
                          <Typography variant="caption" color="text.secondary" component="div">
                            {item.baseUnitNameArabic}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatQuantity(intl, item.currentQuantity)}</TableCell>
                        <TableCell align="right">{formatQuantity(intl, item.minimumQuantity)}</TableCell>
                        <TableCell align="right">{formatQuantity(intl, item.reorderQuantity)}</TableCell>
                        <TableCell align="right">{formatMoney(intl, item.currentAverageUnitCost)}</TableCell>
                        <TableCell align="right">{formatMoney(intl, item.currentInventoryValue)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={stockStatusColor}
                            variant={stockStatusColor === 'default' ? 'outlined' : 'filled'}
                            label={stockStatusLabel}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={item.isActive ? 'success' : 'default'}
                            variant={item.isActive ? 'filled' : 'outlined'}
                            label={intl.formatMessage({ id: item.isActive ? 'active' : 'inactive' })}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title={<FormattedMessage id="details" />}>
                              <IconButton size="small" component={Link} to={`/inventory/items/${item.id}`}>
                                <IconEye size={18} />
                              </IconButton>
                            </Tooltip>
                            <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsUpdate}>
                              <Tooltip title={<FormattedMessage id="edit" />}>
                                <IconButton size="small" component={Link} to={`/inventory/items/${item.id}/edit`}>
                                  <IconEdit size={18} />
                                </IconButton>
                              </Tooltip>
                            </PermissionGuard>
                            <PermissionGuard permission={item.isActive ? INVENTORY_PERMISSIONS.itemsDeactivate : INVENTORY_PERMISSIONS.itemsActivate}>
                              <Tooltip title={<FormattedMessage id={item.isActive ? 'deactivate' : 'activate'} />}>
                                <IconButton size="small" onClick={() => void toggle(item.id, item.isActive)}>
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
              onRowsPerPageChange={(event) => {
                setPageSize(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </MainCard>
    </>
  );
}
