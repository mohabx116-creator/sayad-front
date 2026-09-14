import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import ProductionOrderStatusChip from '../components/ProductionOrderStatusChip';
import { useProductionOrders } from '../hooks/useManufacturing';
import { MANUFACTURING_PERMISSIONS, PRODUCTION_ORDER_STATUSES } from '../utils/manufacturing.constants';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import type { ProductionStatus } from '../types/manufacturing.types';

export default function ProductionOrdersListPage() {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setSearch(initialSearch);
    setPage(0);
  }, [initialSearch]);

  const statusParam = statusFilter !== 'all' ? (statusFilter as ProductionStatus) : undefined;

  const { items, meta, isLoading, mutate } = useProductionOrders({
    page: page + 1,
    pageSize,
    search: search.trim() || undefined,
    status: statusParam
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <PageTitle>
            <FormattedMessage id="manufacturing-orders" defaultMessage="Production Orders" />
          </PageTitle>
          <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersCreate}>
            <Button
              component={Link}
              to="/manufacturing/orders/create"
              variant="contained"
              color="secondary"
              startIcon={<IconPlus size={18} />}
            >
              <FormattedMessage id="create-production-order" defaultMessage="Create Order" />
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder={intl.formatMessage({
                id: 'search-orders-placeholder',
                defaultMessage: 'Search by order number or finished good...'
              })}
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: { xs: '100%', sm: 300 }, flexGrow: 1 }}
            />

            <TextField
              select
              size="small"
              label={intl.formatMessage({ id: 'status', defaultMessage: 'Status' })}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">
                <FormattedMessage id="all" defaultMessage="All" />
              </MenuItem>
              {PRODUCTION_ORDER_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {intl.formatMessage({ id: `production-order-status.${s}`, defaultMessage: s })}
                </MenuItem>
              ))}
            </TextField>

            <Tooltip title={intl.formatMessage({ id: 'reset-filters', defaultMessage: 'Reset Filters' })}>
              <IconButton onClick={handleResetFilters} size="small" color="primary">
                <IconRefresh size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="order-number" defaultMessage="Order #" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="finished-good" defaultMessage="Finished Good" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="bom-code" defaultMessage="BOM" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="planned-qty" defaultMessage="Planned Qty" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="produced-qty" defaultMessage="Produced" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="planned-start" defaultMessage="Start Date" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="planned-end" defaultMessage="End Date" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="type" defaultMessage="Type" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="status" defaultMessage="Status" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="actions" defaultMessage="Actions" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width={90} /></TableCell>
                    <TableCell><Skeleton width={180} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="right"><Skeleton width={60} /></TableCell>
                    <TableCell align="right"><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={90} /></TableCell>
                    <TableCell><Skeleton width={90} /></TableCell>
                    <TableCell align="center"><Skeleton width={70} /></TableCell>
                    <TableCell align="center"><Skeleton width={80} /></TableCell>
                    <TableCell align="center"><Skeleton width={40} /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      <FormattedMessage id="no-orders-found" defaultMessage="No production orders found." />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((order) => {
                  const resolvedFinishedGood = resolveLocalizedText(
                    intl.locale,
                    order.finishedGoodItemNameArabic,
                    order.finishedGoodItemNameEnglish
                  );

                  const progressPct =
                    order.plannedQuantity > 0
                      ? Math.min(100, Math.round((order.producedQuantity / order.plannedQuantity) * 100))
                      : 0;

                  return (
                    <TableRow hover key={order.id}>
                      <TableCell>
                        <Typography
                          component={Link}
                          to={`/manufacturing/orders/${order.id}`}
                          variant="subtitle2"
                          sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 600 }}
                        >
                          {order.number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                            [{order.finishedGoodItemCode}]
                          </Box>
                          {resolvedFinishedGood}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {order.billOfMaterialsCode}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {(order.plannedQuantity ?? 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={progressPct >= 100 ? 'success.main' : progressPct > 0 ? 'secondary.main' : 'text.secondary'}
                        >
                          {(order.producedQuantity ?? 0).toLocaleString()}
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({progressPct}%)
                          </Typography>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(order.plannedStartDate).toLocaleDateString(intl.locale)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(order.plannedEndDate).toLocaleDateString(intl.locale)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {intl.formatMessage({
                            id: `production-ownership.${order.productionType}`,
                            defaultMessage: order.productionType
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <ProductionOrderStatusChip status={order.status} />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={intl.formatMessage({ id: 'view-details', defaultMessage: 'View Details' })}>
                          <IconButton
                            component={Link}
                            to={`/manufacturing/orders/${order.id}`}
                            size="small"
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={meta.totalCount}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </MainCard>
    </Box>
  );
}
