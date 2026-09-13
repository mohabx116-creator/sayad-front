import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import CostVarianceCard from '../components/CostVarianceCard';
import VarianceBarChart from '../components/VarianceBarChart';
import VarianceTable from '../components/VarianceTable';
import { useManufacturingCostVariance } from '../hooks/useManufacturingReports';

export default function ProductionCostVariancePage() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', finishedGoodItemId: '' });
  const params = {
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    finishedGoodItemId: filters.finishedGoodItemId || undefined
  };
  const { varianceReport, isLoading, error } = useManufacturingCostVariance(params);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
          <Typography variant="h3">Cost Variance</Typography>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'flex-end' }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date From"
              value={filters.dateFrom}
              onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date To"
              value={filters.dateTo}
              onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              size="small"
              label="Finished Good Item ID"
              value={filters.finishedGoodItemId}
              onChange={(event) => setFilters((current) => ({ ...current, finishedGoodItemId: event.target.value }))}
            />
            <Button variant="outlined" color="secondary" onClick={() => setFilters({ dateFrom: '', dateTo: '', finishedGoodItemId: '' })}>
              Reset
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      {isLoading && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        </Grid>
      )}

      {error && !isLoading && (
        <Grid item xs={12}>
          <MainCard>
            <Typography color="error">Error loading cost variance data.</Typography>
          </MainCard>
        </Grid>
      )}

      {!isLoading && !error && (
        <>
          <Grid item xs={12}>
            <CostVarianceCard data={varianceReport} />
          </Grid>
          <Grid item xs={12} md={5}>
            <VarianceBarChart data={varianceReport} />
          </Grid>
          <Grid item xs={12} md={7}>
            <VarianceTable data={varianceReport} />
          </Grid>
        </>
      )}
    </Grid>
  );
}
