import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';

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

const money = (value: number | undefined | null) =>
  (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  data?: ProductionCostVarianceDto[] | null;
  compact?: boolean;
};

export default function VarianceTable({ data, compact }: Props) {
  const intl = useIntl();
  const rows = data ?? [];

  return (
    <MainCard
      title={
        compact
          ? intl.formatMessage({ id: 'cost-variance', defaultMessage: 'Cost Variance' })
          : intl.formatMessage({ id: 'production-cost-variance', defaultMessage: 'Production Cost Variance' })
      }
      content={false}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{intl.formatMessage({ id: 'order-number', defaultMessage: 'Order' })}</TableCell>
              {!compact && <TableCell>{intl.formatMessage({ id: 'finished-good', defaultMessage: 'Finished Good' })}</TableCell>}
              <TableCell align="right">{intl.formatMessage({ id: 'planned-cost', defaultMessage: 'Planned' })}</TableCell>
              <TableCell align="right">{intl.formatMessage({ id: 'actual-cost', defaultMessage: 'Actual' })}</TableCell>
              <TableCell align="right">{intl.formatMessage({ id: 'total-variance', defaultMessage: 'Variance' })}</TableCell>
              <TableCell align="right">{intl.formatMessage({ id: 'variance-percentage', defaultMessage: 'Variance %' })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const variance = row.totalVariance ?? 0;
              const color = variance > 0 ? 'error' : variance < 0 ? 'success' : 'default';
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
                    <Typography component="span" color={variance > 0 ? 'error.main' : variance < 0 ? 'success.main' : 'text.primary'}>
                      {money(variance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip size="small" color={color} variant={color === 'default' ? 'outlined' : 'filled'} label={`${(row.variancePercentage ?? 0).toFixed(2)}%`} />
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={compact ? 5 : 6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  {intl.formatMessage({ id: 'no-variance-data', defaultMessage: 'No variance data available' })}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
