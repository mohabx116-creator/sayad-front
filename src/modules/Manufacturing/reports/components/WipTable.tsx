import { useIntl } from 'react-intl';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { ManufacturingWipReportItemDto } from '../types/manufacturingReports.types';

interface Props {
  data?: ManufacturingWipReportItemDto[];
}

const WipTable = ({ data }: Props) => {
  const intl = useIntl();

  if (!data) return null;

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
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.orderNumber}</TableCell>
                <TableCell>{row.finishedProductNameArabic} ({row.finishedProductCode})</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.ownershipType}</TableCell>
                <TableCell align="right">{row.materialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="right">{row.laborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="right">{row.overheadCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="right">{row.totalWip.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
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
