import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconArrowRight, IconBox, IconRefresh } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useInventoryCategories, useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import { useInventoryGlReconciliationReport } from '../hooks/useAccountingReports';
import type {
  InventoryGlReconciliationParams,
  InventoryGlReconciliationRowDto,
  InventoryGlReconciliationSourceTypeTotalsDto
} from '../types/report.types';

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatQueryValue(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function buildItemUrl(itemId: string) {
  return `/inventory/items/${itemId}`;
}

function renderSourceTypeChip(total: InventoryGlReconciliationSourceTypeTotalsDto, locale: string) {
  return (
    <Chip
      key={total.sourceType}
      size="small"
      variant="outlined"
      color={total.balance === 0 ? 'default' : total.balance > 0 ? 'success' : 'error'}
      label={`${total.sourceTypeLabel}: ${formatAmount(locale, total.balance)}`}
    />
  );
}

export default function InventoryGlReconciliationPage() {
  const intl = useIntl();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const [params, setParams] = useState<InventoryGlReconciliationParams>({
    asOfDate: today,
    warehouseId: '',
    itemId: '',
    categoryId: '',
    search: '',
    includeInactiveItems: false,
    includeZeroQuantity: false,
    includeZeroValue: false,
    onlyDifferences: false,
    onlyWarnings: false,
    page: 1,
    pageSize: 20
  });

  const reportParams = useMemo(
    () => ({
      ...params,
      asOfDate: formatQueryValue(params.asOfDate),
      warehouseId: formatQueryValue(params.warehouseId),
      itemId: formatQueryValue(params.itemId),
      categoryId: formatQueryValue(params.categoryId),
      search: formatQueryValue(params.search)
    }),
    [params]
  );

  const { report, error, isLoading, mutate } = useInventoryGlReconciliationReport(reportParams);
  const { items: inventoryItems, isLoading: inventoryItemsLoading } = useInventoryItems({ page: 1, pageSize: 100 });
  const { items: categories, isLoading: categoriesLoading } = useInventoryCategories({ page: 1, pageSize: 100 });

  const rows = report?.rows ?? [];
  const statusChip = report
    ? report.fullIsReconciled
      ? intl.formatMessage({ id: 'inventory-gl-reconciliation-reconciled', defaultMessage: 'Fully reconciled' })
      : intl.formatMessage({ id: 'inventory-gl-reconciliation-not-reconciled', defaultMessage: 'Difference exists' })
    : '';

  const summaryCards = report
    ? [
        { id: 'inventory-gl-reconciliation-item-count', defaultMessage: 'Items', value: report.itemCount, isCount: true },
        { id: 'inventory-gl-reconciliation-warehouse-count', defaultMessage: 'Warehouses', value: report.warehouseCount, isCount: true },
        { id: 'inventory-gl-reconciliation-warning-count', defaultMessage: 'Warning items', value: report.warningItemCount, isCount: true },
        { id: 'inventory-gl-reconciliation-full-operational-value', defaultMessage: 'Authoritative inventory value', value: report.fullOperationalInventoryValue },
        { id: 'inventory-gl-reconciliation-full-ledger-balance', defaultMessage: 'GL balance', value: report.fullInventoryAssetLedgerBalance },
        { id: 'inventory-gl-reconciliation-full-difference', defaultMessage: 'Reconciliation difference', value: report.fullReconciliationDifference },
        { id: 'inventory-gl-reconciliation-filtered-value', defaultMessage: 'Visible inventory value', value: report.filteredOperationalInventoryValue },
        { id: 'inventory-gl-reconciliation-hidden-rows', defaultMessage: 'Hidden rows', value: report.hiddenRowCount, isCount: true }
      ]
    : [];

  const renderRows = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton width={140} /></TableCell>
          <TableCell><Skeleton width={160} /></TableCell>
          <TableCell><Skeleton width={120} /></TableCell>
          <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={60} sx={{ mx: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={120} sx={{ mx: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={120} sx={{ mx: 'auto' }} /></TableCell>
        </TableRow>
      ));
    }

    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
            <Typography color="text.secondary">
              <FormattedMessage id="inventory-gl-reconciliation-empty" defaultMessage="لا توجد صفوف مطابقة لمطابقة المخزون مع الأستاذ العام وفق الفلاتر المحددة." />
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row: InventoryGlReconciliationRowDto) => (
      <TableRow key={`${row.itemId}-${row.warehouseId}`} hover sx={{ bgcolor: row.hasIntegrityWarnings ? 'warning.lighter' : undefined }}>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.itemCode}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.itemArabicName}
            </Typography>
            {row.itemEnglishName && (
              <Typography variant="caption" color="text.secondary">
                {row.itemEnglishName}
              </Typography>
            )}
            <Chip size="small" variant="outlined" label={row.isItemActive ? intl.formatMessage({ id: 'active', defaultMessage: 'Active' }) : intl.formatMessage({ id: 'inactive', defaultMessage: 'Inactive' })} />
          </Stack>
        </TableCell>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.warehouseCode}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.warehouseArabicName}
            </Typography>
            {row.warehouseEnglishName && (
              <Typography variant="caption" color="text.secondary">
                {row.warehouseEnglishName}
              </Typography>
            )}
            <Chip size="small" variant="outlined" label={row.isWarehouseActive ? intl.formatMessage({ id: 'active', defaultMessage: 'Active' }) : intl.formatMessage({ id: 'inactive', defaultMessage: 'Inactive' })} />
          </Stack>
        </TableCell>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.categoryCode || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.categoryArabicName || '-'}
            </Typography>
            {row.categoryEnglishName && (
              <Typography variant="caption" color="text.secondary">
                {row.categoryEnglishName}
              </Typography>
            )}
          </Stack>
        </TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.openingQuantity)}</TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.quantityIn)}</TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.quantityOut)}</TableCell>
        <TableCell align="right">
          <Typography fontWeight={700} color={row.closingQuantity === 0 ? 'text.primary' : row.closingQuantity < 0 ? 'error.main' : 'success.main'}>
            {formatAmount(intl.locale, row.closingQuantity)}
          </Typography>
        </TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.averageUnitCost)}</TableCell>
        <TableCell align="right">
          <Typography fontWeight={700} color={row.operationalInventoryValue === 0 ? 'text.primary' : row.operationalInventoryValue < 0 ? 'error.main' : 'success.main'}>
            {formatAmount(intl.locale, row.operationalInventoryValue)}
          </Typography>
        </TableCell>
        <TableCell align="center">{row.movementCount}</TableCell>
        <TableCell align="center">
          <Chip
            size="small"
            color={row.hasIntegrityWarnings ? 'warning' : 'success'}
            variant="outlined"
            label={row.hasIntegrityWarnings ? `${row.warningCount} ${intl.formatMessage({ id: 'warnings', defaultMessage: 'warnings' })}` : intl.formatMessage({ id: 'ok', defaultMessage: 'OK' })}
          />
        </TableCell>
        <TableCell>
          <Stack spacing={0.75} sx={{ minWidth: 240 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button component={Link} to={buildItemUrl(row.itemId)} size="small" variant="outlined" startIcon={<IconArrowRight size={16} />}>
                <FormattedMessage id="inventory-item" defaultMessage="الصنف" />
              </Button>
            </Stack>
            {row.integrityWarnings.slice(0, 3).map((warning) => (
              <Typography key={warning} variant="caption" color={row.hasIntegrityWarnings ? 'warning.main' : 'text.secondary'}>
                {warning}
              </Typography>
            ))}
          </Stack>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="inventory-gl-reconciliation-report"
        links={[
          { title: 'inventory', to: '/inventory/items' },
          { title: 'accounting-reports', to: '/accounting/reports/general-ledger' },
          { title: 'inventory-gl-reconciliation-report' }
        ]}
      />

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="inventory-gl-reconciliation-report" defaultMessage="تسوية تقييم المخزون مع الأستاذ العام" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 900 }}>
              <FormattedMessage
                id="inventory-gl-reconciliation-report-description"
                defaultMessage="قارن تقييم المخزون المحفوظ مع حساب أصول المخزون المرتبط في الأستاذ العام، مع إبقاء الإجماليات المعتمدة منفصلة عن الصفوف المفلترة."
              />
            </Typography>
          </Box>
          {report && (
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
              <Chip variant="outlined" color={report.fullIsReconciled ? 'success' : 'warning'} label={statusChip} />
              <Chip variant="outlined" label={`${intl.formatMessage({ id: 'as-of-date', defaultMessage: 'As of date' })}: ${report.asOfDate}`} />
            </Stack>
          )}
        </Box>

        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.4}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="as-of-date" defaultMessage="حتى تاريخ" />}
                value={params.asOfDate ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, asOfDate: event.target.value, page: 1 }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="warehouse-id" defaultMessage="معرف المخزن" />}
                value={params.warehouseId ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, warehouseId: event.target.value, page: 1 }))}
                helperText={<FormattedMessage id="warehouse-id-helper" defaultMessage="الصق معرف مخزن لتضييق نطاق المطابقة." />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="inventory-item" defaultMessage="الصنف" />}
                value={params.itemId ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, itemId: event.target.value, page: 1 }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" defaultMessage="الكل" />
                </MenuItem>
                {inventoryItemsLoading && (
                  <MenuItem value="" disabled>
                    <FormattedMessage id="loading" defaultMessage="جارٍ التحميل..." />
                  </MenuItem>
                )}
                {inventoryItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.code} - {item.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="category" defaultMessage="الفئة" />}
                value={params.categoryId ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, categoryId: event.target.value, page: 1 }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" defaultMessage="الكل" />
                </MenuItem>
                {categoriesLoading && (
                  <MenuItem value="" disabled>
                    <FormattedMessage id="loading" defaultMessage="جارٍ التحميل..." />
                  </MenuItem>
                )}
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.code} - {category.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="search" defaultMessage="بحث" />}
                value={params.search ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, search: event.target.value, page: 1 }))}
                helperText={<FormattedMessage id="inventory-gl-reconciliation-search-helper" defaultMessage="ابحث حسب كود الصنف أو اسم الصنف أو كود المخزن أو اسم الفئة." />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Button
                variant="outlined"
                onClick={() => mutate()}
                startIcon={<IconRefresh size={16} />}
                sx={{ width: '100%', height: '100%' }}
              >
                <FormattedMessage id="refresh" defaultMessage="تحديث" />
              </Button>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeInactiveItems ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeInactiveItems: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="include-inactive-items" defaultMessage="تضمين الأصناف غير النشطة" />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeZeroQuantity ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeZeroQuantity: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="include-zero-quantity" defaultMessage="تضمين الكمية الصفرية" />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeZeroValue ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeZeroValue: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="include-zero-value" defaultMessage="تضمين القيمة الصفرية" />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.onlyDifferences ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, onlyDifferences: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="only-differences" defaultMessage="الفروق فقط" />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.onlyWarnings ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, onlyWarnings: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="only-warnings" defaultMessage="التحذيرات فقط" />}
              />
            </Grid>
          </Grid>
        </Card>

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => mutate()}>
                <FormattedMessage id="retry" defaultMessage="إعادة المحاولة" />
              </Button>
            }
          >
            {error instanceof Error ? error.message : intl.formatMessage({ id: 'inventory-gl-reconciliation-load-error', defaultMessage: 'Unable to load the inventory reconciliation report.' })}
          </Alert>
        )}

        {report && (
          <>
            <Grid container spacing={2}>
              {summaryCards.map(({ id, defaultMessage, value, isCount }) => (
                <Grid item xs={12} md={3} key={id}>
                  <Card sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="overline" color="text.secondary">
                      <FormattedMessage id={id} defaultMessage={defaultMessage} />
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                      {isCount ? value : formatAmount(intl.locale, value)}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Chip color={report.fullIsReconciled ? 'success' : 'error'} variant="outlined" label={report.fullIsReconciled ? intl.formatMessage({ id: 'inventory-gl-reconciliation-reconciled-message', defaultMessage: 'Inventory valuation reconciles to the GL account.' }) : intl.formatMessage({ id: 'inventory-gl-reconciliation-not-reconciled-message', defaultMessage: 'Inventory valuation does not reconcile to the GL account.' })} />
              {report.hasHiddenRows && (
                <Chip color="default" variant="outlined" label={`${intl.formatMessage({ id: 'hidden-rows', defaultMessage: 'Hidden rows' })}: ${report.hiddenRowCount}`} />
              )}
              {report.hasIntegrityWarnings && (
                <Chip color="warning" variant="outlined" label={intl.formatMessage({ id: 'integrity-warning', defaultMessage: 'Integrity warning' })} />
              )}
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {report.sourceTypeTotals.map((total) => renderSourceTypeChip(total, intl.locale))}
            </Stack>

            {!report.rows.length && (
              <Alert severity="info">
                <FormattedMessage id="inventory-gl-reconciliation-empty-rows" defaultMessage="لا توجد صفوف مطابقة لمطابقة المخزون مع الأستاذ العام وفق الفلاتر المحددة." />
              </Alert>
            )}

            <MainCard
              title={
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconBox size={18} />
                    <Typography variant="h6" component="span">
                      <FormattedMessage id="inventory-gl-reconciliation-rows" defaultMessage="صفوف المطابقة" />
                    </Typography>
                    <Chip size="small" variant="outlined" label={report.totalCount.toString()} />
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {formatAmount(intl.locale, report.fullReconciliationDifference)}
                  </Typography>
                </Stack>
              }
              contentSX={{ p: 0 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="inventory-item" defaultMessage="الصنف" /></TableCell>
                    <TableCell><FormattedMessage id="warehouse" defaultMessage="المخزن" /></TableCell>
                    <TableCell><FormattedMessage id="category" defaultMessage="الفئة" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="opening-quantity" defaultMessage="الافتتاحي" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="quantity-in" defaultMessage="داخل" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="quantity-out" defaultMessage="خارج" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="closing-quantity" defaultMessage="الختامي" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="average-unit-cost" defaultMessage="متوسط التكلفة" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="inventory-value" defaultMessage="قيمة المخزون" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="movement-count" defaultMessage="الحركات" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="status" defaultMessage="الحالة" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" defaultMessage="الإجراءات" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderRows()}</TableBody>
              </Table>
              <TablePagination
                component="div"
                count={report.totalCount}
                page={Math.max(0, report.page - 1)}
                onPageChange={(_, nextPage) => setParams((current) => ({ ...current, page: nextPage + 1 }))}
                rowsPerPage={report.pageSize}
                onRowsPerPageChange={(event) => setParams((current) => ({ ...current, page: 1, pageSize: Number(event.target.value) }))}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            </MainCard>
          </>
        )}
      </Stack>
    </Box>
  );
}
