import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/GridLegacy';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useProductionCostAnalysis } from '../hooks/useManufacturingReports';
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import CostBreakdownChart from '../components/CostBreakdownChart';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import type { ItemDto } from 'modules/Inventory/types/inventory.types';

const money = (value: number | undefined | null) =>
  (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProductionCostAnalysisPage() {
  const intl = useIntl();

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ItemDto | null>(null);

  const { items: allItems, isLoading: isItemsLoading } = useInventoryItems({ page: 1, pageSize: 500 });

  const params = useMemo(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      finishedGoodItemId: selectedItem?.id || undefined
    }),
    [dateFrom, dateTo, selectedItem]
  );

  const { costAnalysis, isLoading, error } = useProductionCostAnalysis(params);

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedItem(null);
  };

  const rows = costAnalysis ?? [];

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="production-cost-analysis"
        links={[
          { title: 'manufacturing', to: '/manufacturing' },
          { title: 'manufacturing-reports', to: '/manufacturing/reports/cost-analysis' },
          { title: 'production-cost-analysis' }
        ]}
      />
      <Stack spacing={3}>
        <Box>
          <PageTitle>
            <FormattedMessage id="production-cost-analysis" defaultMessage="Production Cost Analysis" />
          </PageTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <FormattedMessage
              id="production-cost-analysis-description"
              defaultMessage="Breakdown and unit cost distribution across completed production batches."
            />
          </Typography>
        </Box>

        <MainCard>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={intl.formatMessage({ id: 'date-from', defaultMessage: 'Date From' })}
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={intl.formatMessage({ id: 'date-to', defaultMessage: 'Date To' })}
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={8} md={4}>
              <Autocomplete
                size="small"
                options={allItems}
                getOptionLabel={(option) =>
                  `[${option.code}] ${resolveLocalizedText(intl.locale, option.nameArabic, option.nameEnglish)}`
                }
                value={selectedItem}
                onChange={(_, newValue) => setSelectedItem(newValue)}
                loading={isItemsLoading}
                renderInput={(fieldParams) => (
                  <TextField
                    {...fieldParams}
                    label={intl.formatMessage({ id: 'finished-good-filter', defaultMessage: 'Finished Good Item' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Button fullWidth variant="outlined" color="secondary" onClick={handleReset}>
                <FormattedMessage id="reset" defaultMessage="Reset" />
              </Button>
            </Grid>
          </Grid>
        </MainCard>

        {error && (
          <Alert severity="error">
            {error instanceof Error
              ? error.message
              : intl.formatMessage({ id: 'error-loading-data', defaultMessage: 'Error loading data.' })}
          </Alert>
        )}

        {isLoading && !costAnalysis && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && !error && (
          <Grid container spacing={3}>
            {rows.length > 0 && (
              <Grid item xs={12} md={5}>
                <CostBreakdownChart data={rows} />
              </Grid>
            )}

            <Grid item xs={12} md={rows.length > 0 ? 7 : 12}>
              <MainCard title={intl.formatMessage({ id: 'cost-details', defaultMessage: 'Cost Details' })} content={false}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{intl.formatMessage({ id: 'finished-good', defaultMessage: 'Finished Good' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'produced-qty', defaultMessage: 'Produced Qty' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'material-cost', defaultMessage: 'Material Cost' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'labor-cost', defaultMessage: 'Labor Cost' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'overhead-cost', defaultMessage: 'Overhead Cost' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'total-cost', defaultMessage: 'Total Cost' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'avg-unit-cost', defaultMessage: 'Avg Unit Cost' })}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            {row.finishedProductNameArabic || row.finishedProductNameEnglish} ({row.finishedProductCode})
                          </TableCell>
                          <TableCell align="right">{money(row.producedQuantity)}</TableCell>
                          <TableCell align="right">{money(row.materialCost)}</TableCell>
                          <TableCell align="right">{money(row.laborCost)}</TableCell>
                          <TableCell align="right">{money(row.overheadCost)}</TableCell>
                          <TableCell align="right">{money(row.totalCost)}</TableCell>
                          <TableCell align="right">{money(row.unitCost)}</TableCell>
                        </TableRow>
                      ))}
                      {rows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            {intl.formatMessage({ id: 'no-data-available', defaultMessage: 'No data available' })}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MainCard>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
