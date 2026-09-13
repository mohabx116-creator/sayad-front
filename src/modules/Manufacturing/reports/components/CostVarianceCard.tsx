import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import MainCard from 'ui-component/cards/MainCard';
import type { ProductionCostVarianceDto } from '../types/manufacturingReports.types';

const money = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  data?: ProductionCostVarianceDto[] | ProductionCostVarianceDto | null;
};

export default function CostVarianceCard({ data }: Props) {
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  const planned = rows.reduce((sum, row) => sum + row.plannedTotalCost, 0);
  const actual = rows.reduce((sum, row) => sum + row.actualTotalCost, 0);
  const variance = actual - planned;
  const percentage = planned === 0 ? 0 : (variance / planned) * 100;
  const color = variance > 0 ? 'error' : variance < 0 ? 'success' : 'default';

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Planned Cost
            </Typography>
            <Typography variant="h4">{money(planned)}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Actual Cost
            </Typography>
            <Typography variant="h4">{money(actual)}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={0.75} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">
              Total Variance
            </Typography>
            <Typography variant="h4" color={variance > 0 ? 'error.main' : variance < 0 ? 'success.main' : 'text.primary'}>
              {money(variance)}
            </Typography>
            <Chip size="small" color={color} variant={color === 'default' ? 'outlined' : 'filled'} label={`${percentage.toFixed(2)}%`} />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
