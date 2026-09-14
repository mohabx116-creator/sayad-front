import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import CostVarianceCard from '../components/CostVarianceCard';
import VarianceBarChart from '../components/VarianceBarChart';
import VarianceTable from '../components/VarianceTable';
import { useManufacturingCostVariance } from '../hooks/useManufacturingReports';
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import type { ItemDto } from 'modules/Inventory/types/inventory.types';

export default function ProductionCostVariancePage() {
  const intl = useIntl();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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

  const { varianceReport, isLoading, error } = useManufacturingCostVariance(params);

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedItem(null);
  };

  const rows = varianceReport ?? [];

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="production-cost-variance"
        links={[
          { title: 'manufacturing', to: '/manufacturing' },
          { title: 'manufacturing-reports', to: '/manufacturing/reports/cost-variance' },
          { title: 'production-cost-variance' }
        ]}
      />
      <Stack spacing={3}>
        <Box>
          <PageTitle>
            <FormattedMessage id="production-cost-variance" defaultMessage="Production Cost Variance" />
          </PageTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <FormattedMessage
              id="production-cost-variance-description"
              defaultMessage="Compare planned BOM and routing costs against actual posted receipts and issues."
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
              : intl.formatMessage({ id: 'error-loading-variance', defaultMessage: 'Error loading cost variance data.' })}
          </Alert>
        )}

        {isLoading && !varianceReport && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && !error && (
          <>
            <CostVarianceCard data={rows} />
            <Grid container spacing={3}>
              {rows.length > 0 && (
                <Grid item xs={12} md={5}>
                  <VarianceBarChart data={rows} />
                </Grid>
              )}
              <Grid item xs={12} md={rows.length > 0 ? 7 : 12}>
                <VarianceTable data={rows} />
              </Grid>
            </Grid>
          </>
        )}
      </Stack>
    </Box>
  );
}
