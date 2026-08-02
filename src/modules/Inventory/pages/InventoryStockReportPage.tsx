import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
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
import Typography from '@mui/material/Typography';
import { IconPackage, IconRefresh, IconReportAnalytics, IconSearch } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useInventoryCategories, useInventoryStockReport, useInventoryWarehouses } from '../hooks/useInventory';

type StockFilter = 'All' | 'Available' | 'LowStock' | 'OutOfStock';

function formatQuantity(intl: ReturnType<typeof useIntl>, value?: number | null) {
  return value == null ? '-' : intl.formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}

function formatMoney(intl: ReturnType<typeof useIntl>, value?: number | null) {
  return value == null ? '-' : intl.formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

function stockStatusChipColor(status: string) {
  switch (status) {
    case 'InStock':
      return 'success';
    case 'LowStock':
      return 'warning';
    default:
      return 'error';
  }
}

function stockStatusLabel(intl: ReturnType<typeof useIntl>, status: string) {
  switch (status) {
    case 'InStock':
      return intl.formatMessage({ id: 'stock-status.in-stock', defaultMessage: 'In Stock' });
    case 'LowStock':
      return intl.formatMessage({ id: 'stock-status.low-stock', defaultMessage: 'Low Stock' });
    case 'OutOfStock':
      return intl.formatMessage({ id: 'stock-status.out-of-stock', defaultMessage: 'Out of Stock' });
    default:
      return status;
  }
}

export default function InventoryStockReportPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [warehouseId, setWarehouseId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('All');
  const [search, setSearch] = useState('');

  const { warehouses, isLoading: warehousesLoading } = useInventoryWarehouses();
  const { items: categories } = useInventoryCategories({ page: 1, pageSize: 100 });

  const { report, isLoading, error, mutate } = useInventoryStockReport({
    page: page + 1,
    pageSize,
    warehouseId: warehouseId || undefined,
    categoryId: categoryId || undefined,
    stockStatus: stockFilter === 'All' ? undefined : stockFilter,
    search: search || undefined
  });

  const rows = report?.rows ?? [];
  const summary = report?.summary;
  const summaryCards = [
    {
      value: 'All' as const,
      labelId: 'stock-summary.total-items',
      defaultMessage: 'Total Items',
      count: summary?.totalItems ?? 0,
      selectable: true
    },
    {
      value: 'Available' as const,
      labelId: 'stock-summary.available-items',
      defaultMessage: 'Available',
      count: summary?.availableItems ?? 0,
      selectable: true
    },
    {
      value: 'LowStock' as const,
      labelId: 'stock-summary.low-stock-items',
      defaultMessage: 'Low Stock',
      count: summary?.lowStockItems ?? 0,
      selectable: true
    },
    {
      value: 'OutOfStock' as const,
      labelId: 'stock-summary.out-of-stock-items',
      defaultMessage: 'Out of Stock',
      count: summary?.outOfStockItems ?? 0,
      selectable: true
    },
    {
      value: 'inventory-value' as const,
      labelId: 'total-stock-value',
      defaultMessage: 'Total Inventory Value',
      count: formatMoney(intl, summary?.totalInventoryValue),
      selectable: false
    }
  ] as const;

  return (
    <>
      <Breadcrumbs custom heading="inventory-stock-report" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'inventory-stock-report' }]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconReportAnalytics color="var(--mui-palette-primary-main)" size={28} />
            <FormattedMessage id="inventory-stock-report" defaultMessage="Stock Report" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="inventory-stock-report-help" defaultMessage="Read-only inventory stock visibility by warehouse, category, and item." />
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button variant="outlined" color="inherit" startIcon={<IconRefresh size={18} />} onClick={() => void mutate()}>
            <FormattedMessage id="refresh" />
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => {
          const isSelected = stockFilter === card.value;

          return (
            <Grid key={card.value} size={{ xs: 12, sm: 6, md: 3 }}>
              {card.selectable ? (
                <ButtonBase
                  onClick={() => {
                    setStockFilter(card.value);
                    setPage(0);
                  }}
                  aria-pressed={isSelected}
                  sx={{ width: '100%', height: '100%', textAlign: 'left', borderRadius: 3 }}
                >
                  <Box
                    sx={(theme) => ({
                      width: '100%',
                      minHeight: 112,
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.main' : 'background.paper',
                      color: isSelected ? 'primary.contrastText' : 'text.primary',
                      boxShadow: isSelected ? theme.shadows[4] : theme.shadows[0],
                      transition: 'all .18s ease',
                      transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
                      '&:hover': {
                        boxShadow: isSelected ? theme.shadows[6] : theme.shadows[2]
                      }
                    })}
                  >
                    <Typography variant="body2" sx={{ opacity: isSelected ? 0.9 : 0.75 }}>
                      <FormattedMessage id={card.labelId} defaultMessage={card.defaultMessage} />
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 1 }}>
                      {card.count}
                    </Typography>
                  </Box>
                </ButtonBase>
              ) : (
                <MainCard sx={{ height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id={card.labelId} defaultMessage={card.defaultMessage} />
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1 }}>
                    {card.count}
                  </Typography>
                </MainCard>
              )}
            </Grid>
          );
        })}
      </Grid>

      <MainCard content={false}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="warehouse" defaultMessage="Warehouse" />}
                value={warehouseId}
                onChange={(event) => {
                  setWarehouseId(event.target.value);
                  setPage(0);
                }}
                disabled={warehousesLoading}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" defaultMessage="All" />
                </MenuItem>
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="item-category" defaultMessage="Category" />}
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">
                  <FormattedMessage id="all-categories" defaultMessage="All Categories" />
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.code} - {category.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label={<FormattedMessage id="search" />}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
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
          </Grid>
        </Box>

        {isLoading && (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <Loader />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">
              <FormattedMessage id="inventory-load-error" defaultMessage="Unable to load inventory data." />
            </Typography>
          </Box>
        )}

        {!isLoading && !error && rows.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <IconPackage size={48} color="var(--mui-palette-grey-400)" />
            <Typography variant="h4" color="text.secondary" sx={{ mt: 2 }}>
              <FormattedMessage id="no-matching-stock-data" defaultMessage="No matching stock data" />
            </Typography>
          </Box>
        )}

        {!isLoading && !error && rows.length > 0 && (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1200 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="item-code" /></TableCell>
                    <TableCell><FormattedMessage id="item-name" defaultMessage="Item Name" /></TableCell>
                    <TableCell><FormattedMessage id="item-category" defaultMessage="Category" /></TableCell>
                    <TableCell><FormattedMessage id="warehouse" defaultMessage="Warehouse" /></TableCell>
                    <TableCell><FormattedMessage id="unit" defaultMessage="Unit" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="available-quantity" defaultMessage="Available Quantity" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="minimum-stock" defaultMessage="Minimum Stock" /></TableCell>
                    <TableCell><FormattedMessage id="stock-status" defaultMessage="Stock Status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="average-unit-cost" defaultMessage="Average Cost" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="inventory-value" defaultMessage="Stock Value" /></TableCell>
                    <TableCell><FormattedMessage id="last-movement" defaultMessage="Last Movement" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow hover key={`${row.itemId}-${row.warehouseId}`}>
                      <TableCell>
                        <Typography component={Link} to={`/inventory/items/${row.itemId}`} color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                          {row.itemCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{row.itemNameArabic}</Typography>
                        {row.itemNameEnglish && (
                          <Typography variant="caption" color="text.secondary" component="div">
                            {row.itemNameEnglish}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row.categoryNameArabic ?? '-'}</TableCell>
                      <TableCell>{row.warehouseCode} - {row.warehouseNameArabic}</TableCell>
                      <TableCell>{row.baseUnitCode}</TableCell>
                      <TableCell align="right">{formatQuantity(intl, row.availableQuantity)}</TableCell>
                      <TableCell align="right">{formatQuantity(intl, row.minimumQuantity)}</TableCell>
                      <TableCell>
                        <Chip size="small" color={stockStatusChipColor(row.stockStatus)} variant="outlined" label={stockStatusLabel(intl, row.stockStatus)} />
                      </TableCell>
                      <TableCell align="right">{formatMoney(intl, row.averageUnitCost)}</TableCell>
                      <TableCell align="right">{formatMoney(intl, row.stockValue)}</TableCell>
                      <TableCell>{formatDate(row.lastMovementDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={report?.totalCount ?? 0}
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
