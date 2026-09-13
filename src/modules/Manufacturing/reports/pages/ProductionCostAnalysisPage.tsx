import { useState } from 'react';
import { useIntl } from 'react-intl';
import { 
  Typography, CircularProgress, Box, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import MainCard from 'ui-component/cards/MainCard';
import { useProductionCostAnalysis } from '../hooks/useManufacturingReports';
import CostBreakdownChart from '../components/CostBreakdownChart';

const ProductionCostAnalysisPage = () => {
  const intl = useIntl();
  
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(undefined);
  const [finishedGoodItemId, setFinishedGoodItemId] = useState<string | undefined>(undefined);

  const { costAnalysis, isLoading, error } = useProductionCostAnalysis({
    dateFrom,
    dateTo,
    finishedGoodItemId
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <MainCard>
        <Typography color="error">{intl.formatMessage({ id: 'error-loading-data', defaultMessage: 'Error loading data.' })}</Typography>
      </MainCard>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">{intl.formatMessage({ id: 'production-cost-analysis', defaultMessage: 'Production Cost Analysis' })}</Typography>
      </Grid>
      
      <Grid item xs={12} md={5}>
        <CostBreakdownChart data={costAnalysis} />
      </Grid>
      
      <Grid item xs={12} md={7}>
        <MainCard title={intl.formatMessage({ id: 'cost-details', defaultMessage: 'Cost Details' })} content={false}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
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
                {costAnalysis?.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.finishedProductNameArabic} ({row.finishedProductCode})</TableCell>
                    <TableCell align="right">{row.producedQuantity}</TableCell>
                    <TableCell align="right">{row.materialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">{row.laborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">{row.overheadCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">{row.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">{row.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
                {(!costAnalysis || costAnalysis.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
  );
};

export default ProductionCostAnalysisPage;
