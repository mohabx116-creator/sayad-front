import { Link } from 'react-router-dom';

import Chip from '@mui/material/Chip';
import LinkMui from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import type { ProductionCostVarianceDto } from '../types/manufacturingReports.types';

const money = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  data?: ProductionCostVarianceDto[] | null;
  compact?: boolean;
};

export default function VarianceTable({ data, compact }: Props) {
  const rows = data ?? [];

  return (
    <MainCard title={compact ? 'Cost Variance' : 'Production Cost Variance'} content={false}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              {!compact && <TableCell>Finished Good</TableCell>}
              <TableCell align="right">Planned</TableCell>
              <TableCell align="right">Actual</TableCell>
              <TableCell align="right">Variance</TableCell>
              <TableCell align="right">Variance %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const color = row.totalVariance > 0 ? 'error' : row.totalVariance < 0 ? 'success' : 'default';
              return (
                <TableRow hover key={row.productionOrderId}>
                  <TableCell>
                    <LinkMui component={Link} to={`/manufacturing/orders/${row.productionOrderId}`} underline="hover">
                      {row.orderNumber}
                    </LinkMui>
                  </TableCell>
                  {!compact && <TableCell>{row.finishedGood}</TableCell>}
                  <TableCell align="right">{money(row.plannedTotalCost)}</TableCell>
                  <TableCell align="right">{money(row.actualTotalCost)}</TableCell>
                  <TableCell align="right">
                    <Typography component="span" color={row.totalVariance > 0 ? 'error.main' : row.totalVariance < 0 ? 'success.main' : 'text.primary'}>
                      {money(row.totalVariance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip size="small" color={color} variant={color === 'default' ? 'outlined' : 'filled'} label={`${row.variancePercentage.toFixed(2)}%`} />
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={compact ? 5 : 6} align="center">
                  No variance data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
