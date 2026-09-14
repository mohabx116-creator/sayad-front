import { useIntl } from 'react-intl';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { ManufacturingWipReportItemDto } from '../types/manufacturingReports.types';
import ProductionOrderStatusChip from '../../components/ProductionOrderStatusChip';
import type { ProductionStatus } from '../../types/manufacturing.types';

interface Props {
  data?: ManufacturingWipReportItemDto[];
}

const money = (value: number | undefined | null) =>
  (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ownershipKey = (value: string | undefined | null) => `production-ownership.${value ?? 'Unknown'}`;

const WipTable = ({ data }: Props) => {
  const intl = useIntl();
  const rows = data ?? [];

  return (
    <MainCard title={intl.formatMessage({ id: 'wip-report-details', defaultMessage: 'WIP Report Details' })} content={false}>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{intl.formatMessage({ id: 'order-number', defaultMessage: 'Order Number' })}</TableCell>
              <TableCell>{intl.formatMessage({ id: 'finished-good', defaultMessage: 'Finished Good' })}</TableCell>
              <TableCell>{intl.formatMessage({ id: 'status', defaultMessage: 'Status' })}</TableCell>
              <TableCell>{intl.formatMessage({ id: 'ownership', defaultMessage: 'Ownership' })}</TableCell>
              <TableCell align="right">{intl.formatMessage({ id: 'material-cost', defaultMessage: 'Material Cost' })}</TableCell>
              <TableCell align="right">{intl.formatMessage({ id: 'labor-cost', defaultMessage: 'Labor Cost' })}</TableCell>
              <TableCell align="right">{intl.formatMessage({ id: 'overhead-cost', defaultMessage: 'Overhead Cost' })}</TableCell>
              <TableCell align="right">{intl.formatMessage({ id: 'wip-value', defaultMessage: 'WIP Value' })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell>{row.orderNumber}</TableCell>
                <TableCell>
                  {row.finishedProductNameArabic} ({row.finishedProductCode})
                </TableCell>
                <TableCell>
                  <ProductionOrderStatusChip status={row.status as ProductionStatus} />
                </TableCell>
                <TableCell>
                  {intl.formatMessage({ id: ownershipKey(row.ownershipType), defaultMessage: row.ownershipType || '-' })}
                </TableCell>
                <TableCell align="right">{money(row.materialCost)}</TableCell>
                <TableCell align="right">{money(row.laborCost)}</TableCell>
                <TableCell align="right">{money(row.overheadCost)}</TableCell>
                <TableCell align="right">{money(row.totalWip)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  {intl.formatMessage({ id: 'no-data-available', defaultMessage: 'No data available' })}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
};

export default WipTable;
