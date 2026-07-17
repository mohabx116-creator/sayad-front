import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import { IconCalculator, IconCirclePlus, IconRefresh, IconSearch } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { initializeInventoryValuation } from '../api/inventoryApi';
import { useInventoryValuations } from '../hooks/useInventory';
import type { InventoryValuationSummaryDto, InitializeInventoryValuationRequest } from '../types/inventory.types';

const today = new Date().toISOString().slice(0, 10);

function money(value?: number | null) {
  return value == null ? '-' : value.toFixed(4);
}

export default function InventoryValuationPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryValuationSummaryDto | null>(null);
  const [form, setForm] = useState<InitializeInventoryValuationRequest>({
    warehouseId: null,
    averageUnitCost: 0,
    effectiveDate: today,
    reason: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const { items, meta, isLoading, error, mutate } = useInventoryValuations({ page: page + 1, pageSize, search });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const canInitialize = useMemo(() => selectedItem && !selectedItem.isValuationInitialized, [selectedItem]);

  const openInitialize = (item: InventoryValuationSummaryDto) => {
    setSelectedItem(item);
    setForm({
      warehouseId: item.warehouseId,
      averageUnitCost: item.averageUnitCost ?? 0,
      effectiveDate: today,
      reason: ''
    });
    setDialogOpen(true);
  };

  const submitInitialize = async () => {
    if (!selectedItem) {
      return;
    }

    try {
      setIsSaving(true);
      await initializeInventoryValuation(selectedItem.itemId, form);
      await mutate();
      setDialogOpen(false);
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="inventory-valuation" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'inventory-valuation' }]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconCalculator color="var(--mui-palette-primary-main)" size={28} />
            <FormattedMessage id="inventory-valuation" defaultMessage="تقييم المخزون" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="inventory-valuation-help" defaultMessage="عرض حالة التقييم المتحرك المتوسط وتهيئة الرصيد القديم عند الحاجة." />
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<IconRefresh size={18} />} onClick={() => void mutate()}>
            <FormattedMessage id="refresh" />
          </Button>
        </Stack>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" color="text.secondary">
            <FormattedMessage id="inventory-valuation-summary" defaultMessage="ملخص تقييم الأصناف" />
          </Typography>
          <TextField
            size="small"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(0); }}
            placeholder={intl.formatMessage({ id: 'search' })}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                  <IconSearch size={18} />
                </Box>
              )
            }}
            sx={{ width: 320 }}
          />
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
                    <TableCell><FormattedMessage id="warehouse" defaultMessage="Warehouse" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="current-quantity" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="average-unit-cost" defaultMessage="Average Cost" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="inventory-value" defaultMessage="Inventory Value" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow hover key={`${item.itemId}-${item.warehouseId}`}>
                      <TableCell>{item.itemCode}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{item.itemNameArabic}</Typography>
                      </TableCell>
                      <TableCell>{item.warehouseCode}</TableCell>
                      <TableCell align="right">{item.quantityOnHandBase}</TableCell>
                      <TableCell align="right">{money(item.averageUnitCost)}</TableCell>
                      <TableCell align="right">{money(item.inventoryValue)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.isValuationInitialized ? item.valuationStatus : 'Legacy'}
                          color={item.isValuationInitialized ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {!item.isValuationInitialized && (
                            <Button size="small" variant="outlined" startIcon={<IconCirclePlus size={16} />} onClick={() => openInitialize(item)}>
                              <FormattedMessage id="initialize" defaultMessage="Initialize" />
                            </Button>
                          )}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <FormattedMessage id="initialize-inventory-valuation" defaultMessage="تهيئة تقييم المخزون" />
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label={<FormattedMessage id="item" />} value={selectedItem?.itemNameArabic ?? ''} InputProps={{ readOnly: true }} />
            <TextField fullWidth label={<FormattedMessage id="warehouse" defaultMessage="Warehouse" />} value={selectedItem?.warehouseCode ?? ''} InputProps={{ readOnly: true }} />
            <TextField
              type="number"
              fullWidth
              label={<FormattedMessage id="average-unit-cost" defaultMessage="Average Cost" />}
              value={form.averageUnitCost}
              onChange={(event) => setForm({ ...form, averageUnitCost: Number(event.target.value) })}
              inputProps={{ min: 0, step: 0.0001 }}
            />
            <TextField
              type="date"
              fullWidth
              label={<FormattedMessage id="effective-date" defaultMessage="Effective Date" />}
              value={form.effectiveDate}
              onChange={(event) => setForm({ ...form, effectiveDate: event.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label={<FormattedMessage id="reason" />}
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button onClick={submitInitialize} variant="contained" disabled={isSaving || !canInitialize}>
            <FormattedMessage id="initialize" defaultMessage="Initialize" />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
